"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { recoveryOfferSchema, recoveryRecipientSchema } from "@/lib/validations/recovery";

type RecoveryActionState = {
  error?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function toDateTimeLocalIso(value: string) {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export async function createRecoveryOfferAction(
  _previousState: RecoveryActionState,
  formData: FormData,
): Promise<RecoveryActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = recoveryOfferSchema.safeParse({
    discountPercent: getStringValue(formData, "discountPercent"),
    endsAt: toDateTimeLocalIso(getStringValue(formData, "endsAt")),
    note: getStringValue(formData, "note"),
    serviceId: getStringValue(formData, "serviceId"),
    staffId: getStringValue(formData, "staffId"),
    startsAt: toDateTimeLocalIso(getStringValue(formData, "startsAt")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Recovery nabídku se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: recovery nabídka by se tady vytvořila." };
  }

  const { error } = await auth.supabase.from("empty_slot_recovery_offers").insert({
    created_by: auth.user.id,
    discount_percent: parsed.data.discountPercent,
    ends_at: parsed.data.endsAt,
    note: parsed.data.note ?? null,
    service_id: parsed.data.serviceId,
    staff_id: parsed.data.staffId ?? null,
    starts_at: parsed.data.startsAt,
    tenant_id: auth.tenantId,
  });

  if (error) {
    return { error: "Recovery nabídku se nepodařilo uložit." };
  }

  revalidatePath("/recovery");

  return { success: "Recovery nabídka byla vytvořena." };
}

export async function addRecoveryRecipientAction(
  _previousState: RecoveryActionState,
  formData: FormData,
): Promise<RecoveryActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = recoveryRecipientSchema.safeParse({
    clientId: getStringValue(formData, "clientId"),
    offerId: getStringValue(formData, "offerId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Klienta se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: klient by se přidal do recovery nabídky." };
  }

  const { error } = await auth.supabase.from("empty_slot_recovery_recipients").upsert(
    {
      client_id: parsed.data.clientId,
      offer_id: parsed.data.offerId,
      tenant_id: auth.tenantId,
    },
    { onConflict: "tenant_id,offer_id,client_id" },
  );

  if (error) {
    return { error: "Klienta se nepodařilo přidat do recovery nabídky." };
  }

  revalidatePath("/recovery");

  return { success: "Klient byl přidán do recovery nabídky." };
}
