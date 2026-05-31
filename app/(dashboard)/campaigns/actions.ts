"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { lastMinuteOfferSchema, marketingCampaignSchema } from "@/lib/validations/campaigns";

type CampaignActionState = {
  error?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createMarketingCampaignAction(
  _previousState: CampaignActionState,
  formData: FormData,
): Promise<CampaignActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = marketingCampaignSchema.safeParse({
    channel: getStringValue(formData, "channel"),
    message: getStringValue(formData, "message"),
    name: getStringValue(formData, "name"),
    scheduledAt: getStringValue(formData, "scheduledAt"),
    segment: getStringValue(formData, "segment"),
    subject: getStringValue(formData, "subject"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kampaň se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: kampaň by se tady uložila jako draft." };
  }

  const { error } = await auth.supabase.from("marketing_campaigns").insert({
    channel: parsed.data.channel,
    created_by: auth.user.id,
    message: parsed.data.message,
    name: parsed.data.name,
    scheduled_at: parsed.data.scheduledAt ?? null,
    segment: parsed.data.segment,
    status: parsed.data.scheduledAt ? "scheduled" : "draft",
    subject: parsed.data.subject ?? null,
    tenant_id: auth.tenantId,
  });

  if (error) {
    return { error: "Kampaň se nepodařilo uložit." };
  }

  revalidatePath("/campaigns");

  return { success: "Kampaň byla uložena." };
}

export async function createLastMinuteOfferAction(
  _previousState: CampaignActionState,
  formData: FormData,
): Promise<CampaignActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = lastMinuteOfferSchema.safeParse({
    discountPercent: getStringValue(formData, "discountPercent") || "0",
    endsAt: getStringValue(formData, "endsAt"),
    note: getStringValue(formData, "note"),
    serviceId: getStringValue(formData, "serviceId"),
    staffId: getStringValue(formData, "staffId"),
    startsAt: getStringValue(formData, "startsAt"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Last Minute nabídku se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: Last Minute nabídka by se tady uložila." };
  }

  const { error } = await auth.supabase.from("last_minute_offers").insert({
    created_by: auth.user.id,
    discount_percent: parsed.data.discountPercent,
    ends_at: parsed.data.endsAt,
    note: parsed.data.note ?? null,
    service_id: parsed.data.serviceId ?? null,
    staff_id: parsed.data.staffId ?? null,
    starts_at: parsed.data.startsAt,
    status: "draft",
    tenant_id: auth.tenantId,
  });

  if (error) {
    return { error: "Last Minute nabídku se nepodařilo uložit." };
  }

  revalidatePath("/campaigns");

  return { success: "Last Minute nabídka byla uložena." };
}
