"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import {
  generateTenantApiKey,
  getTenantApiKeyLast4,
  getTenantApiKeyPrefix,
  hashTenantApiKey,
} from "@/lib/api-keys/keys";
import { hasSupabaseEnv } from "@/lib/env";
import { apiKeyIdSchema, apiKeyNameSchema } from "@/lib/validations/integrations";

type ApiKeyActionState = {
  error?: string;
  success?: string;
  token?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createTenantApiKeyAction(
  _previousState: ApiKeyActionState,
  formData: FormData,
): Promise<ApiKeyActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = apiKeyNameSchema.safeParse({ name: getStringValue(formData, "name") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "API klíč se nepodařilo ověřit." };
  }

  const token = generateTenantApiKey();

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: API klíč by se tady vytvořil.", token };
  }

  const { error } = await auth.supabase.from("tenant_api_keys").insert({
    created_by: auth.user.id,
    name: parsed.data.name,
    scopes: ["bookings:read"],
    tenant_id: auth.tenantId,
    token_hash: hashTenantApiKey(token),
    token_last4: getTenantApiKeyLast4(token),
    token_prefix: getTenantApiKeyPrefix(token),
  });

  if (error) {
    return { error: "API klíč se nepodařilo vytvořit." };
  }

  revalidatePath("/integrations");

  return {
    success: "API klíč byl vytvořen. Zobrazí se jen jednou.",
    token,
  };
}

export async function revokeTenantApiKeyAction(
  _previousState: ApiKeyActionState,
  formData: FormData,
): Promise<ApiKeyActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = apiKeyIdSchema.safeParse(getStringValue(formData, "keyId"));

  if (!parsed.success) {
    return { error: "API klíč se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: API klíč by se tady odvolal." };
  }

  const { error } = await auth.supabase
    .from("tenant_api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", parsed.data)
    .eq("tenant_id", auth.tenantId)
    .is("revoked_at", null);

  if (error) {
    return { error: "API klíč se nepodařilo odvolat." };
  }

  revalidatePath("/integrations");

  return { success: "API klíč byl odvolán." };
}
