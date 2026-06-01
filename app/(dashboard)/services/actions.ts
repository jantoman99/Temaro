"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { isServiceTimeStepAligned, SERVICE_TIME_STEP_MINUTES } from "@/lib/service-form-limits";
import { findMatchingService } from "@/lib/services/find-matching-service";
import { getServiceTemplate } from "@/lib/service-templates";
import { isTenantIndustry, type TenantIndustry } from "@/lib/tenant-industry";
import type { Database } from "@/types/database";
import { createServiceSchema, serviceIdSchema, updateServiceSchema } from "@/lib/validations/services";

type ServiceActionState = {
  error?: string;
  success?: string;
};

async function hasActiveFutureBookingsForService(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  serviceId: string,
) {
  const { count, error } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("service_id", serviceId)
    .in("status", ["pending", "confirmed"])
    .gt("starts_at", new Date().toISOString());

  if (error) {
    return null;
  }

  return (count ?? 0) > 0;
}

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getTemplateIds(formData: FormData) {
  return formData
    .getAll("templateIds")
    .flatMap((value) => (typeof value === "string" ? value.split(",") : []))
    .map((value) => value.trim())
    .filter(Boolean);
}

function ignoreRevalidateError(action: () => void) {
  try {
    action();
  } catch {
    // Zmena uz je ulozena; chyba obnoveni cache nesmi vratit falesny neuspech.
  }
}

export async function createServiceAction(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = createServiceSchema.safeParse({
    name: getStringValue(formData, "name"),
    description: getStringValue(formData, "description") || undefined,
    durationMinutes: getStringValue(formData, "durationMinutes"),
    price: getStringValue(formData, "price"),
    currency: getStringValue(formData, "currency") || "CZK",
    bufferMinutes: getStringValue(formData, "bufferMinutes") || "0",
    depositType: getStringValue(formData, "depositType") || "none",
    depositValue: getStringValue(formData, "depositValue"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatná služba." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: služba by se tady uložila do databáze." };
  }

  let existingService: Awaited<ReturnType<typeof findMatchingService>>;

  try {
    existingService = await findMatchingService(auth.supabase, auth.tenantId, parsed.data.name);
  } catch {
    return { error: "Existující službu se nepodařilo ověřit." };
  }

  if (existingService) {
    return { error: "Služba s tímto názvem už existuje." };
  }

  const { error } = await auth.supabase.from("services").insert({
    tenant_id: auth.tenantId,
    name: parsed.data.name,
    description: parsed.data.description || null,
    duration_minutes: parsed.data.durationMinutes,
    price: parsed.data.price,
    currency: parsed.data.currency,
    buffer_minutes: parsed.data.bufferMinutes,
    deposit_type: parsed.data.depositType,
    deposit_value: parsed.data.depositValue,
  });

  if (error) {
    return { error: "Službu se nepodařilo vytvořit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/services");
  });

  return { success: "Služba byla vytvořena." };
}

export async function createStarterServicesAction(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const templateIds = Array.from(new Set(getTemplateIds(formData))).slice(0, 5);

  if (templateIds.length === 0) {
    return { error: "Vyberte alespoň jednu službu." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: vybrané služby by se tady přidaly do nabídky." };
  }

  const { data: tenant, error: tenantError } = await auth.supabase
    .from("tenants")
    .select("industry")
    .eq("id", auth.tenantId)
    .is("deleted_at", null)
    .single();

  if (tenantError || !tenant) {
    return { error: "Podnik se nepodařilo ověřit." };
  }

  const industry: TenantIndustry = isTenantIndustry(tenant.industry) ? tenant.industry : "hair";
  const templates = templateIds
    .map((templateId) => getServiceTemplate(templateId, industry))
    .filter((template): template is NonNullable<typeof template> => Boolean(template));

  if (templates.length === 0) {
    return { error: "Vybrané služby neodpovídají oboru podniku." };
  }

  const { data: existingServices, error: existingServicesError } = await auth.supabase
    .from("services")
    .select("name")
    .eq("tenant_id", auth.tenantId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .in("name", templates.map((template) => template.name));

  if (existingServicesError) {
    return { error: "Existující služby se nepodařilo ověřit." };
  }

  const existingNames = new Set((existingServices ?? []).map((service) => service.name.toLowerCase()));
  const servicesToInsert = templates
    .filter((template) => !existingNames.has(template.name.toLowerCase()))
    .map((template, index) => ({
      tenant_id: auth.tenantId,
      name: template.name,
      description: template.description,
      duration_minutes: template.durationMinutes,
      price: Math.round(Number(template.price.replace(",", ".")) * 100),
      currency: "CZK" as const,
      buffer_minutes: template.bufferMinutes,
      deposit_type: "none" as const,
      deposit_value: 0,
      position: index,
    }));

  if (servicesToInsert.length === 0) {
    return { success: "Vybrané služby už v nabídce máte." };
  }

  const { error } = await auth.supabase.from("services").insert(servicesToInsert);

  if (error) {
    return { error: "Služby se nepodařilo přidat." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/services");
    revalidatePath("/start");
  });

  const skippedCount = templates.length - servicesToInsert.length;
  const serviceLabel = servicesToInsert.length === 1 ? "službu" : servicesToInsert.length < 5 ? "služby" : "služeb";
  const skippedLabel = skippedCount === 1 ? "Jedna už existovala." : `${skippedCount} už existovaly.`;

  return {
    success: skippedCount > 0
      ? `Přidali jsme ${servicesToInsert.length} ${serviceLabel}. ${skippedLabel}`
      : `Přidali jsme ${servicesToInsert.length} ${serviceLabel}.`,
  };
}

export async function hideServiceAction(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = serviceIdSchema.safeParse({
    serviceId: getStringValue(formData, "serviceId"),
  });

  if (!parsed.success) {
    return { error: "Službu se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: služba by se tady skryla." };
  }

  const hasFutureBookings = await hasActiveFutureBookingsForService(
    auth.supabase,
    auth.tenantId,
    parsed.data.serviceId,
  );

  if (hasFutureBookings) {
    return { error: "Službu nejde skrýt, protože má ještě budoucí rezervace." };
  }

  if (hasFutureBookings === null) {
    return { error: "Budoucí rezervace služby se nepodařilo ověřit." };
  }

  const { data: hiddenService, error } = await auth.supabase
    .from("services")
    .update({
      is_active: false,
      deleted_at: new Date().toISOString(),
    })
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.serviceId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !hiddenService) {
    return { error: "Službu se nepodařilo skrýt." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/services");
  });

  return { success: "Služba byla skryta." };
}

export async function updateServiceAction(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = updateServiceSchema.safeParse({
    serviceId: getStringValue(formData, "serviceId"),
    name: getStringValue(formData, "name"),
    description: getStringValue(formData, "description") || undefined,
    durationMinutes: getStringValue(formData, "durationMinutes"),
    price: getStringValue(formData, "price"),
    currency: getStringValue(formData, "currency") || "CZK",
    bufferMinutes: getStringValue(formData, "bufferMinutes") || "0",
    depositType: getStringValue(formData, "depositType") || "none",
    depositValue: getStringValue(formData, "depositValue"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatná úprava služby." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: služba by se tady upravila." };
  }

  let existingService: Awaited<ReturnType<typeof findMatchingService>>;

  try {
    existingService = await findMatchingService(auth.supabase, auth.tenantId, parsed.data.name);
  } catch {
    return { error: "Existující službu se nepodařilo ověřit." };
  }

  if (existingService && existingService.id !== parsed.data.serviceId) {
    return { error: "Jiná služba už používá tento název." };
  }

  const { data: currentService, error: currentServiceError } = await auth.supabase
    .from("services")
    .select("id, duration_minutes, buffer_minutes")
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.serviceId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (currentServiceError) {
    return { error: "Službu se nepodařilo ověřit." };
  }

  if (!currentService) {
    return { error: "Služba už není dostupná." };
  }

  const durationMinutesChanged = currentService.duration_minutes !== parsed.data.durationMinutes;
  const bufferMinutesChanged = currentService.buffer_minutes !== parsed.data.bufferMinutes;
  const durationChanged = durationMinutesChanged || bufferMinutesChanged;

  if (durationChanged) {
    if (durationMinutesChanged && !isServiceTimeStepAligned(parsed.data.durationMinutes)) {
      return { error: `Délka služby musí být v násobcích ${SERVICE_TIME_STEP_MINUTES} minut.` };
    }

    if (bufferMinutesChanged && !isServiceTimeStepAligned(parsed.data.bufferMinutes)) {
      return { error: `Buffer musí být v násobcích ${SERVICE_TIME_STEP_MINUTES} minut.` };
    }

    const hasFutureBookings = await hasActiveFutureBookingsForService(
      auth.supabase,
      auth.tenantId,
      parsed.data.serviceId,
    );

    if (hasFutureBookings) {
      return { error: "Časové parametry služby nejde změnit, protože má ještě budoucí rezervace." };
    }

    if (hasFutureBookings === null) {
      return { error: "Budoucí rezervace služby se nepodařilo ověřit." };
    }
  }

  const { data: updatedService, error } = await auth.supabase
    .from("services")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      duration_minutes: parsed.data.durationMinutes,
      price: parsed.data.price,
      currency: parsed.data.currency,
      buffer_minutes: parsed.data.bufferMinutes,
      deposit_type: parsed.data.depositType,
      deposit_value: parsed.data.depositValue,
    })
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.serviceId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !updatedService) {
    return { error: "Službu se nepodařilo upravit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/services");
  });

  return { success: "Služba byla upravena." };
}
