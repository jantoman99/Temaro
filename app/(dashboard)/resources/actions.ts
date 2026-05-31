"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { resourceSchema, serviceResourceSchema } from "@/lib/validations/resources";

type ResourceActionState = {
  error?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createResourceAction(
  _previousState: ResourceActionState,
  formData: FormData,
): Promise<ResourceActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = resourceSchema.safeParse({
    capacity: getStringValue(formData, "capacity") || "1",
    description: getStringValue(formData, "description"),
    name: getStringValue(formData, "name"),
    resourceType: getStringValue(formData, "resourceType"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Zdroj se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: zdroj by se tady vytvořil." };
  }

  const { error } = await auth.supabase.from("bookable_resources").insert({
    capacity: parsed.data.capacity,
    description: parsed.data.description ?? null,
    name: parsed.data.name,
    resource_type: parsed.data.resourceType,
    tenant_id: auth.tenantId,
  });

  if (error) {
    return { error: "Zdroj se nepodařilo uložit." };
  }

  revalidatePath("/resources");

  return { success: "Zdroj byl vytvořen." };
}

export async function assignServiceResourceAction(
  _previousState: ResourceActionState,
  formData: FormData,
): Promise<ResourceActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = serviceResourceSchema.safeParse({
    resourceId: getStringValue(formData, "resourceId"),
    serviceId: getStringValue(formData, "serviceId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Vazbu zdroje se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: zdroj by se tady přiřadil ke službě." };
  }

  const { error } = await auth.supabase.from("service_resources").upsert(
    {
      resource_id: parsed.data.resourceId,
      service_id: parsed.data.serviceId,
      tenant_id: auth.tenantId,
    },
    { onConflict: "tenant_id,service_id,resource_id" },
  );

  if (error) {
    return { error: "Zdroj se nepodařilo přiřadit ke službě." };
  }

  revalidatePath("/resources");

  return { success: "Zdroj byl přiřazen ke službě." };
}
