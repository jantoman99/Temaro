"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { getNextBillingDate } from "@/lib/memberships/dates";
import {
  assignMembershipSchema,
  createMembershipPlanSchema,
  updateMembershipStatusSchema,
} from "@/lib/validations/memberships";

type MembershipActionState = {
  error?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createMembershipPlanAction(
  _previousState: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = createMembershipPlanSchema.safeParse({
    billingPeriod: getStringValue(formData, "billingPeriod"),
    currency: getStringValue(formData, "currency"),
    description: getStringValue(formData, "description"),
    includedCredit: getStringValue(formData, "includedCredit"),
    includedUnits: getStringValue(formData, "includedUnits"),
    name: getStringValue(formData, "name"),
    price: getStringValue(formData, "price"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Členství se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: plán členství by se tady vytvořil." };
  }

  const { error } = await auth.supabase.from("membership_plans").insert({
    billing_period: parsed.data.billingPeriod,
    currency: parsed.data.currency,
    description: parsed.data.description ?? null,
    included_credit: parsed.data.includedCredit,
    included_units: parsed.data.includedUnits,
    name: parsed.data.name,
    price: parsed.data.price,
    tenant_id: auth.tenantId,
  });

  if (error) {
    return { error: "Plán členství se nepodařilo uložit." };
  }

  revalidatePath("/memberships");

  return { success: "Plán členství byl vytvořen." };
}

export async function assignMembershipAction(
  _previousState: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const today = new Date().toISOString().slice(0, 10);
  const parsed = assignMembershipSchema.safeParse({
    clientId: getStringValue(formData, "clientId"),
    membershipPlanId: getStringValue(formData, "membershipPlanId"),
    note: getStringValue(formData, "note"),
    startsAt: getStringValue(formData, "startsAt") || today,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Přiřazení členství se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: členství by se tady přiřadilo klientovi." };
  }

  const { data: plan, error: planError } = await auth.supabase
    .from("membership_plans")
    .select("id, billing_period")
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.membershipPlanId)
    .eq("is_active", true)
    .maybeSingle();

  if (planError || !plan) {
    return { error: "Plán členství už není dostupný." };
  }

  const startsAt = new Date(`${parsed.data.startsAt}T00:00:00.000Z`);
  const { error } = await auth.supabase.from("client_memberships").insert({
    client_id: parsed.data.clientId,
    created_by: auth.user.id,
    current_period_start: parsed.data.startsAt,
    membership_plan_id: plan.id,
    next_billing_date: getNextBillingDate(startsAt, plan.billing_period),
    note: parsed.data.note ?? null,
    starts_at: parsed.data.startsAt,
    tenant_id: auth.tenantId,
  });

  if (error) {
    return { error: "Členství se nepodařilo přiřadit klientovi." };
  }

  revalidatePath("/memberships");

  return { success: "Členství bylo přiřazeno klientovi." };
}

export async function updateMembershipStatusAction(formData: FormData): Promise<void> {
  const auth = await requireOwner();

  if ("error" in auth || !hasSupabaseEnv()) {
    return;
  }

  const parsed = updateMembershipStatusSchema.safeParse({
    membershipId: getStringValue(formData, "membershipId"),
    status: getStringValue(formData, "status"),
  });

  if (!parsed.success) {
    return;
  }

  await auth.supabase
    .from("client_memberships")
    .update({
      cancelled_at: parsed.data.status === "cancelled" ? new Date().toISOString() : null,
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.membershipId);

  revalidatePath("/memberships");
}
