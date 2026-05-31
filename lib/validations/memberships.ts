import { z } from "zod";

import { PRICE_INPUT_MAX_LENGTH } from "@/lib/price-input";

const positiveAmountSchema = z
  .string()
  .trim()
  .max(PRICE_INPUT_MAX_LENGTH, "Částka je příliš dlouhá.")
  .regex(/^\d+([,.]\d{1,2})?$/, "Částka musí být číslo s maximálně dvěma desetinnými místy.")
  .transform((value) => Math.round(Number(value.replace(",", ".")) * 100))
  .pipe(z.number().int().min(1).max(10_000_000));

const optionalAmountSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? "")
  .refine((value) => value === "" || /^\d+([,.]\d{1,2})?$/.test(value), "Částka musí být číslo s maximálně dvěma desetinnými místy.")
  .transform((value) => (value === "" ? null : Math.round(Number(value.replace(",", ".")) * 100)))
  .pipe(z.number().int().min(0).max(10_000_000).nullable());

const optionalUnitsSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? "")
  .refine((value) => value === "" || /^\d+$/.test(value), "Počet vstupů musí být celé číslo.")
  .transform((value) => (value === "" ? null : Number(value)))
  .pipe(z.number().int().min(0).max(1000).nullable());

export const createMembershipPlanSchema = z.object({
  billingPeriod: z.enum(["monthly", "quarterly", "yearly"]),
  currency: z.enum(["CZK", "EUR"]).default("CZK"),
  description: z.string().trim().max(500, "Popis je příliš dlouhý.").optional().transform((value) => value || undefined),
  includedCredit: optionalAmountSchema,
  includedUnits: optionalUnitsSchema,
  name: z.string().trim().min(1, "Název členství je povinný.").max(120, "Název členství je příliš dlouhý."),
  price: positiveAmountSchema,
});

export const assignMembershipSchema = z.object({
  clientId: z.string().uuid(),
  membershipPlanId: z.string().uuid(),
  note: z.string().trim().max(500, "Poznámka je příliš dlouhá.").optional().transform((value) => value || undefined),
  startsAt: z.string().date("Začátek členství není validní datum."),
});

export const updateMembershipStatusSchema = z.object({
  membershipId: z.string().uuid(),
  status: z.enum(["active", "paused", "cancelled", "expired"]),
});

export type CreateMembershipPlanInput = z.infer<typeof createMembershipPlanSchema>;
export type AssignMembershipInput = z.infer<typeof assignMembershipSchema>;
export type UpdateMembershipStatusInput = z.infer<typeof updateMembershipStatusSchema>;
