"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { commissionRuleSchema } from "@/lib/validations/commissions";

type CommissionActionState = {
  error?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function upsertCommissionRuleAction(
  _previousState: CommissionActionState,
  formData: FormData,
): Promise<CommissionActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = commissionRuleSchema.safeParse({
    currency: getStringValue(formData, "currency") || "CZK",
    fixedAmount: getStringValue(formData, "fixedAmount"),
    note: getStringValue(formData, "note"),
    percent: getStringValue(formData, "percent"),
    ruleType: getStringValue(formData, "ruleType") || "percent_paid_revenue",
    staffId: getStringValue(formData, "staffId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Provizní pravidlo se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: provizní pravidlo by se tady uložilo." };
  }

  const { error } = await auth.supabase.from("staff_commission_rules").upsert(
    {
      currency: parsed.data.currency,
      fixed_amount: parsed.data.ruleType === "fixed_completed_booking" ? parsed.data.fixedAmount : 0,
      note: parsed.data.note ?? null,
      percent_bps: parsed.data.ruleType === "percent_paid_revenue" ? parsed.data.percent : 0,
      rule_type: parsed.data.ruleType,
      staff_id: parsed.data.staffId,
      tenant_id: auth.tenantId,
    },
    { onConflict: "tenant_id,staff_id" },
  );

  if (error) {
    return { error: "Provizní pravidlo se nepodařilo uložit." };
  }

  revalidatePath("/commissions");

  return { success: "Provizní pravidlo bylo uloženo." };
}
