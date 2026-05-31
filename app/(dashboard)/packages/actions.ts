"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { assignClientPassSchema, createPackageSchema, redeemClientPassSchema } from "@/lib/validations/packages";

type PackageActionState = {
  error?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createPackageAction(_previousState: PackageActionState, formData: FormData): Promise<PackageActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = createPackageSchema.safeParse({
    creditAmount: getStringValue(formData, "creditAmount") || undefined,
    currency: getStringValue(formData, "currency"),
    name: getStringValue(formData, "name"),
    packageType: getStringValue(formData, "packageType"),
    price: getStringValue(formData, "price"),
    serviceId: getStringValue(formData, "serviceId"),
    totalUnits: getStringValue(formData, "totalUnits"),
    validityDays: getStringValue(formData, "validityDays"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Balíček se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: balíček by se tady vytvořil." };
  }

  const { error } = await auth.supabase.from("service_packages").insert({
    credit_amount: parsed.data.packageType === "credit" ? parsed.data.creditAmount ?? null : null,
    currency: parsed.data.currency,
    name: parsed.data.name,
    package_type: parsed.data.packageType,
    price: parsed.data.price,
    service_id: parsed.data.serviceId ?? null,
    tenant_id: auth.tenantId,
    total_units: parsed.data.packageType === "sessions" ? parsed.data.totalUnits : null,
    validity_days: parsed.data.validityDays,
  });

  if (error) {
    return { error: "Balíček se nepodařilo uložit." };
  }

  revalidatePath("/packages");

  return { success: "Balíček byl vytvořen." };
}

export async function assignClientPassAction(
  _previousState: PackageActionState,
  formData: FormData,
): Promise<PackageActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = assignClientPassSchema.safeParse({
    clientId: getStringValue(formData, "clientId"),
    note: getStringValue(formData, "note"),
    packageId: getStringValue(formData, "packageId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Permanentku se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: permanentka by se tady přiřadila klientovi." };
  }

  const { data: packageOffer, error: packageError } = await auth.supabase
    .from("service_packages")
    .select("id, package_type, total_units, credit_amount, validity_days")
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.packageId)
    .eq("is_active", true)
    .maybeSingle();

  if (packageError || !packageOffer) {
    return { error: "Balíček už není dostupný." };
  }

  const expiresAt = packageOffer.validity_days
    ? new Date(Date.now() + packageOffer.validity_days * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await auth.supabase.from("client_passes").insert({
    client_id: parsed.data.clientId,
    created_by: auth.user.id,
    expires_at: expiresAt,
    note: parsed.data.note ?? null,
    package_id: packageOffer.id,
    package_type: packageOffer.package_type,
    remaining_credit: packageOffer.package_type === "credit" ? packageOffer.credit_amount : null,
    remaining_units: packageOffer.package_type === "sessions" ? packageOffer.total_units : null,
    tenant_id: auth.tenantId,
  });

  if (error) {
    return { error: "Permanentku se nepodařilo přiřadit klientovi." };
  }

  revalidatePath("/packages");

  return { success: "Permanentka byla přiřazena klientovi." };
}

export async function redeemClientPassAction(
  _previousState: PackageActionState,
  formData: FormData,
): Promise<PackageActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = redeemClientPassSchema.safeParse({
    clientPassId: getStringValue(formData, "clientPassId"),
    creditUsed: getStringValue(formData, "creditUsed") || undefined,
    note: getStringValue(formData, "note"),
    unitsUsed: getStringValue(formData, "unitsUsed"),
    usageType: getStringValue(formData, "usageType"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Čerpání permanentky se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: permanentka by se tady vyčerpala." };
  }

  const { error } = await auth.supabase.rpc("redeem_client_pass", {
    p_client_pass_id: parsed.data.clientPassId,
    p_credit_used: parsed.data.usageType === "credit" ? parsed.data.creditUsed ?? null : null,
    p_note: parsed.data.note ?? null,
    p_units_used: parsed.data.usageType === "sessions" ? parsed.data.unitsUsed : null,
  });

  if (error) {
    return { error: "Permanentku se nepodařilo vyčerpat. Ověřte typ, expiraci a zůstatek." };
  }

  revalidatePath("/packages");

  return { success: "Permanentka byla vyčerpána." };
}
