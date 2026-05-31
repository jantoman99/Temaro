"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { groupClassEnrollmentSchema, groupClassSchema } from "@/lib/validations/group-classes";

type ClassActionState = {
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

export async function createGroupClassAction(
  _previousState: ClassActionState,
  formData: FormData,
): Promise<ClassActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = groupClassSchema.safeParse({
    capacity: getStringValue(formData, "capacity") || "1",
    currency: getStringValue(formData, "currency") || "CZK",
    endsAt: toDateTimeLocalIso(getStringValue(formData, "endsAt")),
    locationId: getStringValue(formData, "locationId"),
    note: getStringValue(formData, "note"),
    price: getStringValue(formData, "price"),
    resourceId: getStringValue(formData, "resourceId"),
    serviceId: getStringValue(formData, "serviceId"),
    staffId: getStringValue(formData, "staffId"),
    startsAt: toDateTimeLocalIso(getStringValue(formData, "startsAt")),
    title: getStringValue(formData, "title"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Lekci se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: skupinová lekce by se tady vytvořila." };
  }

  const { error } = await auth.supabase.from("group_classes").insert({
    capacity: parsed.data.capacity,
    currency: parsed.data.currency,
    ends_at: parsed.data.endsAt,
    location_id: parsed.data.locationId ?? null,
    note: parsed.data.note ?? null,
    price: parsed.data.price ?? null,
    resource_id: parsed.data.resourceId ?? null,
    service_id: parsed.data.serviceId,
    staff_id: parsed.data.staffId ?? null,
    starts_at: parsed.data.startsAt,
    tenant_id: auth.tenantId,
    title: parsed.data.title,
  });

  if (error) {
    return { error: "Lekci se nepodařilo uložit." };
  }

  revalidatePath("/classes");

  return { success: "Skupinová lekce byla vytvořena." };
}

export async function enrollGroupClassAction(
  _previousState: ClassActionState,
  formData: FormData,
): Promise<ClassActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = groupClassEnrollmentSchema.safeParse({
    clientId: getStringValue(formData, "clientId"),
    groupClassId: getStringValue(formData, "groupClassId"),
    note: getStringValue(formData, "note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Přihlášení účastníka se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: klient by se přihlásil na lekci." };
  }

  const { error } = await auth.supabase.rpc("enroll_group_class", {
    p_client_id: parsed.data.clientId,
    p_group_class_id: parsed.data.groupClassId,
    p_note: parsed.data.note ?? null,
  });

  if (error) {
    return { error: "Klienta se nepodařilo přihlásit. Zkontrolujte kapacitu a duplicitu." };
  }

  revalidatePath("/classes");

  return { success: "Klient byl přihlášen na lekci." };
}
