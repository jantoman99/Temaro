"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { createVoucherSchema, redeemVoucherSchema } from "@/lib/validations/vouchers";
import { generateVoucherCode, getVoucherCodeLast4, hashVoucherCode } from "@/lib/vouchers/code";

type VoucherActionState = {
  code?: string;
  error?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createVoucherAction(_previousState: VoucherActionState, formData: FormData): Promise<VoucherActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = createVoucherSchema.safeParse({
    amount: getStringValue(formData, "amount"),
    currency: getStringValue(formData, "currency"),
    expiresAt: getStringValue(formData, "expiresAt"),
    issuedToEmail: getStringValue(formData, "issuedToEmail"),
    issuedToName: getStringValue(formData, "issuedToName"),
    label: getStringValue(formData, "label"),
    note: getStringValue(formData, "note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Voucher se nepodařilo ověřit." };
  }

  const code = generateVoucherCode();

  if (!hasSupabaseEnv()) {
    return { code, success: "Demo režim: voucher by se tady vytvořil." };
  }

  const { error } = await auth.supabase.from("vouchers").insert({
    code_hash: hashVoucherCode(code),
    code_last4: getVoucherCodeLast4(code),
    created_by: auth.user.id,
    currency: parsed.data.currency,
    expires_at: parsed.data.expiresAt ? new Date(`${parsed.data.expiresAt}T23:59:59.999Z`).toISOString() : null,
    initial_amount: parsed.data.amount,
    issued_to_email: parsed.data.issuedToEmail ?? null,
    issued_to_name: parsed.data.issuedToName ?? null,
    label: parsed.data.label,
    note: parsed.data.note ?? null,
    remaining_amount: parsed.data.amount,
    tenant_id: auth.tenantId,
  });

  if (error) {
    return { error: "Voucher se nepodařilo uložit." };
  }

  revalidatePath("/vouchers");

  return { code, success: "Voucher byl vytvořen. Kód se zobrazí jen teď." };
}

export async function redeemVoucherAction(_previousState: VoucherActionState, formData: FormData): Promise<VoucherActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = redeemVoucherSchema.safeParse({
    amount: getStringValue(formData, "amount"),
    code: getStringValue(formData, "code"),
    note: getStringValue(formData, "note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Čerpání voucheru se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: voucher by se tady vyčerpal." };
  }

  const { error } = await auth.supabase.rpc("redeem_voucher", {
    p_amount: parsed.data.amount,
    p_code_hash: hashVoucherCode(parsed.data.code),
    p_note: parsed.data.note ?? null,
  });

  if (error) {
    return { error: "Voucher se nepodařilo vyčerpat. Ověřte kód, expiraci a zůstatek." };
  }

  revalidatePath("/vouchers");

  return { success: "Voucher byl vyčerpán." };
}
