"use server";

import { revalidatePath } from "next/cache";

import { createBookingSelfServiceToken } from "@/lib/booking/self-service";
import {
  getTenantOwnerRecipients,
  sendBookingPendingEmail,
  sendOwnerNewBookingEmail,
  type BookingDetails,
} from "@/lib/email/booking-confirmation";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { limitPublicBooking } from "@/lib/rate-limit/public-booking";
import { createAdminClient } from "@/lib/supabase/admin";
import { safePostCommit } from "@/lib/utils/post-commit";
import { createPublicBookingSchema, createWaitlistEntrySchema } from "@/lib/validations/bookings";
import { createBookingSourceMetadata } from "@/lib/booking/source";
import { demoTenant } from "@/lib/demo/data";

type PublicBookingActionState = {
  error?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createPublicBookingAction(
  _previousState: PublicBookingActionState,
  formData: FormData,
): Promise<PublicBookingActionState> {
  const parsed = createPublicBookingSchema.safeParse({
    slug: getStringValue(formData, "slug"),
    serviceId: getStringValue(formData, "serviceId"),
    staffId: getStringValue(formData, "staffId"),
    startsAt: getStringValue(formData, "startsAt"),
    clientName: getStringValue(formData, "clientName"),
    clientPhone: getStringValue(formData, "clientPhone"),
    clientEmail: getStringValue(formData, "clientEmail"),
    notes: getStringValue(formData, "notes"),
    ref: getStringValue(formData, "ref"),
    source: getStringValue(formData, "source") || "online",
    sourceDetail: getStringValue(formData, "sourceDetail"),
    utmCampaign: getStringValue(formData, "utmCampaign"),
    utmContent: getStringValue(formData, "utmContent"),
    utmMedium: getStringValue(formData, "utmMedium"),
    utmSource: getStringValue(formData, "utmSource"),
    utmTerm: getStringValue(formData, "utmTerm"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Rezervaci se nepodařilo vytvořit." };
  }

  if (parsed.data.slug === demoTenant.slug || !hasSupabaseAdminEnv()) {
    return { success: "Demo režim: rezervace by se tady uložila do databáze." };
  }

  let rateLimit = { success: true };

  try {
    rateLimit = await limitPublicBooking(parsed.data.slug);
  } catch {
    rateLimit = { success: true };
  }

  if (!rateLimit.success) {
    return { error: "Příliš mnoho pokusů. Zkuste to prosím později." };
  }

  const supabase = createAdminClient();
  const sourceMetadata = createBookingSourceMetadata({
    ...(parsed.data.utmSource ? { utm_source: parsed.data.utmSource } : {}),
    ...(parsed.data.utmMedium ? { utm_medium: parsed.data.utmMedium } : {}),
    ...(parsed.data.utmCampaign ? { utm_campaign: parsed.data.utmCampaign } : {}),
    ...(parsed.data.utmTerm ? { utm_term: parsed.data.utmTerm } : {}),
    ...(parsed.data.utmContent ? { utm_content: parsed.data.utmContent } : {}),
    ...(parsed.data.ref ? { ref: parsed.data.ref } : {}),
  });
  const { data: booking, error } = await supabase.rpc("create_public_booking", {
    p_tenant_slug: parsed.data.slug,
    p_staff_id: parsed.data.staffId,
    p_service_id: parsed.data.serviceId,
    p_starts_at: parsed.data.startsAt,
    p_client_name: parsed.data.clientName,
    p_client_phone: parsed.data.clientPhone ?? null,
    p_client_email: parsed.data.clientEmail ?? null,
    p_notes: parsed.data.notes ?? null,
    p_source: parsed.data.source,
    p_source_detail: parsed.data.sourceDetail ?? null,
    p_source_metadata: sourceMetadata,
  });

  if (error) {
    return { error: "Rezervaci se nepodařilo vytvořit. Vyberte prosím jiný termín." };
  }

  if (!booking) {
    return { error: "Rezervaci se nepodařilo vytvořit. Vyberte prosím jiný termín." };
  }

  await safePostCommit(async () => {
    await supabase.from("booking_events").insert({
      tenant_id: booking.tenant_id,
      booking_id: booking.id,
      actor_user_id: null,
      actor_type: "client",
      event_type: "created",
      metadata: {
        source: parsed.data.source,
        source_detail: parsed.data.sourceDetail ?? null,
        source_metadata: sourceMetadata,
      },
    });
  }, "public booking event insert");

  await safePostCommit(async () => {
    const { data: details } = await supabase
      .from("bookings")
      .select(
        "id, tenant_id, starts_at, ends_at, clients!bookings_client_tenant_fkey(id, full_name, email, phone), services(name), staff(name), tenants(name, timezone, confirmation_message, reminder_message)",
      )
      .eq("id", booking.id)
      .eq("tenant_id", booking.tenant_id)
      .single();

    if (details) {
      const notificationDetails: BookingDetails = {
        bookingId: details.id,
        clientEmail: details.clients?.email ?? null,
        clientId: details.clients?.id ?? null,
        clientName: details.clients?.full_name ?? parsed.data.clientName,
        clientPhone: details.clients?.phone ?? parsed.data.clientPhone ?? null,
        endsAt: details.ends_at,
        manageUrl: null,
        serviceName: details.services?.name ?? "Služba",
        staffName: details.staff?.name ?? "Poskytovatel",
        startsAt: details.starts_at,
        tenantId: details.tenant_id,
        tenantName: details.tenants?.name ?? parsed.data.slug,
        timeZone: details.tenants?.timezone ?? null,
        confirmationMessage: details.tenants?.confirmation_message ?? null,
        reminderMessage: details.tenants?.reminder_message ?? null,
      };

      if (notificationDetails.clientEmail) {
        try {
          const token = await createBookingSelfServiceToken(supabase, {
            bookingId: notificationDetails.bookingId,
            tenantId: notificationDetails.tenantId,
          });

          notificationDetails.manageUrl = token.url;
        } catch {
          notificationDetails.manageUrl = null;
        }
      }

      await sendBookingPendingEmail(supabase, notificationDetails);

      const ownerRecipients = await getTenantOwnerRecipients(supabase, notificationDetails.tenantId);

      if (ownerRecipients.length > 0) {
        await sendOwnerNewBookingEmail(supabase, notificationDetails, ownerRecipients);
      }
    }
  }, "public booking notifications");

  await safePostCommit(() => {
    revalidatePath(`/${parsed.data.slug}`);
  }, "public booking revalidate");

  return { success: "Rezervace byla odeslána. Podnik ji ještě musí potvrdit." };
}

export async function joinWaitlistAction(
  _previousState: PublicBookingActionState,
  formData: FormData,
): Promise<PublicBookingActionState> {
  const parsed = createWaitlistEntrySchema.safeParse({
    slug: getStringValue(formData, "slug"),
    serviceId: getStringValue(formData, "serviceId"),
    staffId: getStringValue(formData, "staffId"),
    clientName: getStringValue(formData, "clientName"),
    clientPhone: getStringValue(formData, "clientPhone"),
    clientEmail: getStringValue(formData, "clientEmail"),
    notes: getStringValue(formData, "notes"),
    ref: getStringValue(formData, "ref"),
    source: getStringValue(formData, "source") || "online",
    sourceDetail: getStringValue(formData, "sourceDetail"),
    utmCampaign: getStringValue(formData, "utmCampaign"),
    utmContent: getStringValue(formData, "utmContent"),
    utmMedium: getStringValue(formData, "utmMedium"),
    utmSource: getStringValue(formData, "utmSource"),
    utmTerm: getStringValue(formData, "utmTerm"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Do čekací listiny se nepodařilo zapsat." };
  }

  if (parsed.data.slug === demoTenant.slug || !hasSupabaseAdminEnv()) {
    return { success: "Demo režim: kontakt by se tady uložil do čekací listiny." };
  }

  let rateLimit = { success: true };

  try {
    rateLimit = await limitPublicBooking(parsed.data.slug);
  } catch {
    rateLimit = { success: true };
  }

  if (!rateLimit.success) {
    return { error: "Příliš mnoho pokusů. Zkuste to prosím později." };
  }

  const supabase = createAdminClient();
  const sourceMetadata = createBookingSourceMetadata({
    ...(parsed.data.utmSource ? { utm_source: parsed.data.utmSource } : {}),
    ...(parsed.data.utmMedium ? { utm_medium: parsed.data.utmMedium } : {}),
    ...(parsed.data.utmCampaign ? { utm_campaign: parsed.data.utmCampaign } : {}),
    ...(parsed.data.utmTerm ? { utm_term: parsed.data.utmTerm } : {}),
    ...(parsed.data.utmContent ? { utm_content: parsed.data.utmContent } : {}),
    ...(parsed.data.ref ? { ref: parsed.data.ref } : {}),
  });
  const { data: waitlistEntry, error } = await supabase.rpc("create_waitlist_entry", {
    p_tenant_slug: parsed.data.slug,
    p_service_id: parsed.data.serviceId,
    p_staff_id: parsed.data.staffId,
    p_client_name: parsed.data.clientName,
    p_client_phone: parsed.data.clientPhone ?? null,
    p_client_email: parsed.data.clientEmail ?? null,
    p_notes: parsed.data.notes ?? null,
    p_source: parsed.data.source,
    p_source_detail: parsed.data.sourceDetail ?? null,
    p_source_metadata: sourceMetadata,
  });

  if (error || !waitlistEntry) {
    return { error: "Do čekací listiny se nepodařilo zapsat. Zkontrolujte prosím kontakt." };
  }

  await safePostCommit(() => {
    revalidatePath(`/${parsed.data.slug}`);
  }, "public waitlist revalidate");

  return { success: "Jste na čekací listině. Podnik se ozve, jakmile se uvolní vhodný termín." };
}
