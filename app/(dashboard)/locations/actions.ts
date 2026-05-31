"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { tenantLocationSchema } from "@/lib/validations/locations";

type LocationActionState = {
  error?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createTenantLocationAction(
  _previousState: LocationActionState,
  formData: FormData,
): Promise<LocationActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = tenantLocationSchema.safeParse({
    address: getStringValue(formData, "address"),
    city: getStringValue(formData, "city"),
    countryCode: getStringValue(formData, "countryCode") || "CZ",
    email: getStringValue(formData, "email"),
    isPrimary: formData.get("isPrimary") === "on",
    latitude: getStringValue(formData, "latitude"),
    longitude: getStringValue(formData, "longitude"),
    name: getStringValue(formData, "name"),
    phone: getStringValue(formData, "phone"),
    postalCode: getStringValue(formData, "postalCode"),
    region: getStringValue(formData, "region"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Pobočku se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: pobočka by se tady vytvořila." };
  }

  if (parsed.data.isPrimary) {
    await auth.supabase
      .from("tenant_locations")
      .update({ is_primary: false })
      .eq("tenant_id", auth.tenantId)
      .eq("is_primary", true);
  }

  const { error } = await auth.supabase.from("tenant_locations").insert({
    address: parsed.data.address ?? null,
    city: parsed.data.city ?? null,
    country_code: parsed.data.countryCode,
    email: parsed.data.email ?? null,
    is_primary: parsed.data.isPrimary,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    name: parsed.data.name,
    phone: parsed.data.phone ?? null,
    postal_code: parsed.data.postalCode ?? null,
    region: parsed.data.region ?? null,
    tenant_id: auth.tenantId,
  });

  if (error) {
    return { error: "Pobočku se nepodařilo uložit." };
  }

  revalidatePath("/locations");

  return { success: "Pobočka byla vytvořena." };
}
