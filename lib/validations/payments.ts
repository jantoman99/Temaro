import { z } from "zod";

import { PRICE_INPUT_MAX_LENGTH } from "@/lib/price-input";

const amountSchema = z
  .string()
  .trim()
  .max(PRICE_INPUT_MAX_LENGTH, "Částka je příliš dlouhá.")
  .regex(/^\d+([,.]\d{1,2})?$/, "Částka musí být číslo s maximálně dvěma desetinnými místy.")
  .transform((value) => Math.round(Number(value.replace(",", ".")) * 100))
  .pipe(z.number().int().min(1).max(1_000_000));

export const recordBookingPaymentSchema = z.object({
  amount: amountSchema,
  bookingId: z.string().uuid(),
  currency: z.enum(["CZK", "EUR"]).default("CZK"),
  method: z.enum(["cash", "card_terminal", "online_card", "bank_transfer", "voucher", "other"]),
  note: z.string().trim().max(500).optional().transform((value) => value || undefined),
  paymentScope: z.enum(["deposit", "remaining", "full", "other"]).default("full"),
});

export const posCheckoutSchema = z.object({
  bookingId: z.string().uuid(),
  method: z.enum(["cash", "card_terminal", "bank_transfer", "voucher", "other"]),
  note: z.string().trim().max(500).optional().transform((value) => value || undefined),
});

export type RecordBookingPaymentInput = z.infer<typeof recordBookingPaymentSchema>;
export type PosCheckoutInput = z.infer<typeof posCheckoutSchema>;
