import { z } from "zod";

import { PRICE_INPUT_MAX_LENGTH } from "@/lib/price-input";

const amountSchema = z
  .string()
  .trim()
  .max(PRICE_INPUT_MAX_LENGTH, "Částka je příliš dlouhá.")
  .regex(/^\d+([,.]\d{1,2})?$/, "Částka musí být číslo s maximálně dvěma desetinnými místy.")
  .transform((value) => Math.round(Number(value.replace(",", ".")) * 100))
  .pipe(z.number().int().min(0).max(10_000_000));

const positiveAmountSchema = amountSchema.pipe(z.number().int().min(1));

const optionalPositiveIntegerSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? "")
  .refine((value) => value === "" || /^\d+$/.test(value), "Hodnota musí být celé číslo.")
  .transform((value) => (value === "" ? null : Number(value)))
  .pipe(z.number().int().min(1).max(1000).nullable());

const optionalValiditySchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? "")
  .refine((value) => value === "" || /^\d+$/.test(value), "Platnost musí být počet dní.")
  .transform((value) => (value === "" ? null : Number(value)))
  .pipe(z.number().int().min(1).max(3650).nullable());

export const createPackageSchema = z
  .object({
    creditAmount: positiveAmountSchema.optional(),
    currency: z.enum(["CZK", "EUR"]).default("CZK"),
    name: z.string().trim().min(1, "Název balíčku je povinný.").max(120, "Název balíčku je příliš dlouhý."),
    packageType: z.enum(["sessions", "credit"]),
    price: amountSchema,
    serviceId: z.string().uuid().optional().or(z.literal("")).transform((value) => value || undefined),
    totalUnits: optionalPositiveIntegerSchema,
    validityDays: optionalValiditySchema,
  })
  .refine((value) => value.packageType !== "sessions" || value.totalUnits !== null, {
    message: "Permanentka musí mít počet vstupů.",
    path: ["totalUnits"],
  })
  .refine((value) => value.packageType !== "credit" || value.creditAmount !== undefined, {
    message: "Kreditní balíček musí mít výši kreditu.",
    path: ["creditAmount"],
  });

export const assignClientPassSchema = z.object({
  clientId: z.string().uuid(),
  note: z.string().trim().max(500, "Poznámka je příliš dlouhá.").optional().transform((value) => value || undefined),
  packageId: z.string().uuid(),
});

export const redeemClientPassSchema = z
  .object({
    clientPassId: z.string().uuid(),
    creditUsed: positiveAmountSchema.optional(),
    note: z.string().trim().max(500, "Poznámka je příliš dlouhá.").optional().transform((value) => value || undefined),
    unitsUsed: optionalPositiveIntegerSchema,
    usageType: z.enum(["sessions", "credit"]),
  })
  .refine((value) => value.usageType !== "sessions" || value.unitsUsed !== null, {
    message: "Zadejte počet čerpaných vstupů.",
    path: ["unitsUsed"],
  })
  .refine((value) => value.usageType !== "credit" || value.creditUsed !== undefined, {
    message: "Zadejte čerpaný kredit.",
    path: ["creditUsed"],
  });

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type AssignClientPassInput = z.infer<typeof assignClientPassSchema>;
export type RedeemClientPassInput = z.infer<typeof redeemClientPassSchema>;
