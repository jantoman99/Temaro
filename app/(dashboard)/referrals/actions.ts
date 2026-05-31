"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { generateReferralCode, getReferralCodeLast4, hashReferralCode } from "@/lib/referrals/code";
import { issueReferralCodeSchema, referralProgramSchema } from "@/lib/validations/referrals";

type ReferralActionState = {
  code?: string;
  error?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createReferralProgramAction(
  _previousState: ReferralActionState,
  formData: FormData,
): Promise<ReferralActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = referralProgramSchema.safeParse({
    currency: getStringValue(formData, "currency") || "CZK",
    maxUsesPerCode: getStringValue(formData, "maxUsesPerCode"),
    name: getStringValue(formData, "name"),
    note: getStringValue(formData, "note"),
    referredRewardAmount: getStringValue(formData, "referredRewardAmount"),
    referrerRewardAmount: getStringValue(formData, "referrerRewardAmount"),
    rewardType: getStringValue(formData, "rewardType") || "credit",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Referral program se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: referral program by se tady vytvořil." };
  }

  const { error } = await auth.supabase.from("referral_programs").insert({
    created_by: auth.user.id,
    currency: parsed.data.currency,
    max_uses_per_code: parsed.data.maxUsesPerCode ?? null,
    name: parsed.data.name,
    note: parsed.data.note ?? null,
    referred_reward_amount: parsed.data.referredRewardAmount,
    referrer_reward_amount: parsed.data.referrerRewardAmount,
    reward_type: parsed.data.rewardType,
    tenant_id: auth.tenantId,
  });

  if (error) {
    return { error: "Referral program se nepodařilo uložit." };
  }

  revalidatePath("/referrals");

  return { success: "Referral program byl vytvořen." };
}

export async function issueReferralCodeAction(
  _previousState: ReferralActionState,
  formData: FormData,
): Promise<ReferralActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = issueReferralCodeSchema.safeParse({
    clientId: getStringValue(formData, "clientId"),
    label: getStringValue(formData, "label"),
    programId: getStringValue(formData, "programId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Referral kód se nepodařilo ověřit." };
  }

  const code = generateReferralCode();

  if (!hasSupabaseEnv()) {
    return { code, success: "Demo režim: referral kód by se tady vydal." };
  }

  const { error } = await auth.supabase.from("referral_codes").insert({
    client_id: parsed.data.clientId ?? null,
    code_hash: hashReferralCode(code),
    code_last4: getReferralCodeLast4(code),
    created_by: auth.user.id,
    label: parsed.data.label ?? null,
    program_id: parsed.data.programId,
    tenant_id: auth.tenantId,
  });

  if (error) {
    return { error: "Referral kód se nepodařilo uložit." };
  }

  revalidatePath("/referrals");

  return { code, success: "Referral kód byl vydán. Celý kód se zobrazí jen teď." };
}
