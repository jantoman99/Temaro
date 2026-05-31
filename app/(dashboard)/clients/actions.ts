"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { findMatchingClient } from "@/lib/clients/find-matching-client";
import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";
import {
  clientIdSchema,
  createClientSchema,
  flagClientSchema,
  updateClientSchema,
} from "@/lib/validations/clients";

type ClientActionState = {
  error?: string;
  success?: string;
};

async function hasActiveFutureBookingsForClient(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  clientId: string,
) {
  const { count, error } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("client_id", clientId)
    .in("status", ["pending", "confirmed"])
    .gt("starts_at", new Date().toISOString());

  if (error) {
    return null;
  }

  return (count ?? 0) > 0;
}

async function isPreferredStaffActive(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  preferredStaffId?: string,
) {
  if (!preferredStaffId) {
    return true;
  }

  const { data: staffMember, error } = await supabase
    .from("staff")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("id", preferredStaffId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    return null;
  }

  return Boolean(staffMember);
}

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function ignoreRevalidateError(action: () => void) {
  try {
    action();
  } catch {
    // Zmena uz je ulozena; chyba obnoveni cache nesmi vratit falesny neuspech.
  }
}

export async function createClientAction(
  _previousState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = createClientSchema.safeParse({
    clientTier: getStringValue(formData, "clientTier") || "standard",
    fullName: getStringValue(formData, "fullName"),
    phone: getStringValue(formData, "phone"),
    email: getStringValue(formData, "email"),
    notes: getStringValue(formData, "notes"),
    preferenceNotes: getStringValue(formData, "preferenceNotes"),
    preferredContactChannel: getStringValue(formData, "preferredContactChannel") || "any",
    preferredStaffId: getStringValue(formData, "preferredStaffId"),
    preferredTimeOfDay: getStringValue(formData, "preferredTimeOfDay") || "any",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatný klient." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: klient by se tady uložil do databáze." };
  }

  let existingClient: Awaited<ReturnType<typeof findMatchingClient>>;

  try {
    existingClient = await findMatchingClient(auth.supabase, auth.tenantId, {
      email: parsed.data.email,
      phone: parsed.data.phone,
    });
  } catch {
    return { error: "Existujícího klienta se nepodařilo ověřit." };
  }

  if (existingClient) {
    return { error: "Klient s tímto emailem nebo telefonem už existuje." };
  }

  const preferredStaffIsActive = await isPreferredStaffActive(
    auth.supabase,
    auth.tenantId,
    parsed.data.preferredStaffId,
  );

  if (preferredStaffIsActive === null) {
    return { error: "Oblíbeného zaměstnance se nepodařilo ověřit." };
  }

  if (!preferredStaffIsActive) {
    return { error: "Vybraný oblíbený zaměstnanec už není aktivní." };
  }

  const { error } = await auth.supabase.from("clients").insert({
    tenant_id: auth.tenantId,
    full_name: parsed.data.fullName,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    notes: parsed.data.notes || null,
    preference_notes: parsed.data.preferenceNotes || null,
    preferred_contact_channel: parsed.data.preferredContactChannel,
    preferred_staff_id: parsed.data.preferredStaffId || null,
    preferred_time_of_day: parsed.data.preferredTimeOfDay,
    client_tier: parsed.data.clientTier,
  });

  if (error) {
    return { error: "Klienta se nepodařilo vytvořit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/clients");
  });

  return { success: "Klient byl vytvořen." };
}

export async function toggleClientFlagAction(
  _previousState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = flagClientSchema.safeParse({
    clientId: getStringValue(formData, "clientId"),
    isFlagged: getStringValue(formData, "isFlagged"),
    flagReason: getStringValue(formData, "flagReason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Flag klienta se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: flag klienta by se tady upravil." };
  }

  const { data: updatedClient, error } = await auth.supabase
    .from("clients")
    .update({
      is_flagged: parsed.data.isFlagged,
      flag_reason: parsed.data.isFlagged ? parsed.data.flagReason || null : null,
    })
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.clientId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !updatedClient) {
    return { error: "Flag klienta se nepodařilo upravit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/clients");
    revalidatePath(`/clients/${parsed.data.clientId}`);
  });

  return { success: parsed.data.isFlagged ? "Klient byl označen flagem." : "Flag byl odebrán." };
}

export async function hideClientAction(
  _previousState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = clientIdSchema.safeParse({
    clientId: getStringValue(formData, "clientId"),
  });

  if (!parsed.success) {
    return { error: "Klienta se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: klient by se tady skryl." };
  }

  const hasFutureBookings = await hasActiveFutureBookingsForClient(
    auth.supabase,
    auth.tenantId,
    parsed.data.clientId,
  );

  if (hasFutureBookings) {
    return { error: "Klienta nejde skrýt, protože má ještě budoucí rezervace." };
  }

  if (hasFutureBookings === null) {
    return { error: "Budoucí rezervace klienta se nepodařilo ověřit." };
  }

  const { data: hiddenClient, error } = await auth.supabase
    .from("clients")
    .update({ deleted_at: new Date().toISOString() })
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.clientId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !hiddenClient) {
    return { error: "Klienta se nepodařilo skrýt." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/clients");
    revalidatePath(`/clients/${parsed.data.clientId}`);
  });

  return { success: "Klient byl skryt." };
}

export async function updateClientAction(
  _previousState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = updateClientSchema.safeParse({
    clientTier: getStringValue(formData, "clientTier") || "standard",
    clientId: getStringValue(formData, "clientId"),
    fullName: getStringValue(formData, "fullName"),
    phone: getStringValue(formData, "phone"),
    email: getStringValue(formData, "email"),
    notes: getStringValue(formData, "notes"),
    preferenceNotes: getStringValue(formData, "preferenceNotes"),
    preferredContactChannel: getStringValue(formData, "preferredContactChannel") || "any",
    preferredStaffId: getStringValue(formData, "preferredStaffId"),
    preferredTimeOfDay: getStringValue(formData, "preferredTimeOfDay") || "any",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatná úprava klienta." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: klient by se tady upravil." };
  }

  let existingClient: Awaited<ReturnType<typeof findMatchingClient>>;

  try {
    existingClient = await findMatchingClient(auth.supabase, auth.tenantId, {
      email: parsed.data.email,
      phone: parsed.data.phone,
    });
  } catch {
    return { error: "Existujícího klienta se nepodařilo ověřit." };
  }

  if (existingClient && existingClient.id !== parsed.data.clientId) {
    return { error: "Jiný klient už používá tento email nebo telefon." };
  }

  const preferredStaffIsActive = await isPreferredStaffActive(
    auth.supabase,
    auth.tenantId,
    parsed.data.preferredStaffId,
  );

  if (preferredStaffIsActive === null) {
    return { error: "Oblíbeného zaměstnance se nepodařilo ověřit." };
  }

  if (!preferredStaffIsActive) {
    return { error: "Vybraný oblíbený zaměstnanec už není aktivní." };
  }

  const { data: updatedClient, error } = await auth.supabase
    .from("clients")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      notes: parsed.data.notes || null,
      preference_notes: parsed.data.preferenceNotes || null,
      preferred_contact_channel: parsed.data.preferredContactChannel,
      preferred_staff_id: parsed.data.preferredStaffId || null,
      preferred_time_of_day: parsed.data.preferredTimeOfDay,
      client_tier: parsed.data.clientTier,
    })
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.clientId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !updatedClient) {
    return { error: "Klienta se nepodařilo upravit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/clients");
    revalidatePath(`/clients/${parsed.data.clientId}`);
  });

  return { success: "Klient byl upraven." };
}
