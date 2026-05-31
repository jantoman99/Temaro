import { z } from "zod";

import { PRICE_INPUT_MAX_LENGTH } from "@/lib/price-input";
import { normalizeVoucherCode } from "@/lib/vouchers/code";

const amountSchema = z
  .string()
  .trim()
  .max(PRICE_INPUT_MAX_LENGTH, "Částka je příliš dlouhá.")
  .regex(/^\d+([,.]\d{1,2})?$/, "Částka musí být číslo s maximálně dvěma desetinnými místy.")
  .transform((value) => Math.round(Number(value.replace(",", ".")) * 100))
  .pipe(z.number().int().min(1).max(1_000_000));

export const createVoucherSchema = z.object({
  amount: amountSchema,
  currency: z.enum(["CZK", "EUR"]).default("CZK"),
  expiresAt: z.string().trim().optional().transform((value) => value || undefined),
  issuedToEmail: z.string().trim().email("E-mail není validní.").max(254).optional().or(z.literal("")).transform((value) => value || undefined),
  issuedToName: z.string().trim().max(120, "Jméno je příliš dlouhé.").optional().transform((value) => value || undefined),
  label: z.string().trim().min(1, "Název voucheru je povinný.").max(120, "Název voucheru je příliš dlouhý."),
  note: z.string().trim().max(500, "Poznámka je příliš dlouhá.").optional().transform((value) => value || undefined),
});

export const redeemVoucherSchema = z.object({
  amount: amountSchema,
  code: z
    .string()
    .trim()
    .min(8, "Kód voucheru je příliš krátký.")
    .max(32, "Kód voucheru je příliš dlouhý.")
    .transform(normalizeVoucherCode)
    .refine((value) => /^[A-Z0-9]{8,24}$/.test(value), "Kód voucheru není validní."),
  note: z.string().trim().max(500, "Poznámka je příliš dlouhá.").optional().transform((value) => value || undefined),
});

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type RedeemVoucherInput = z.infer<typeof redeemVoucherSchema>;
