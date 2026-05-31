import { z } from "zod";

import { PRICE_INPUT_MAX_LENGTH } from "@/lib/price-input";

const optionalPriceSchema = z
  .string()
  .trim()
  .max(PRICE_INPUT_MAX_LENGTH, "Cena je příliš dlouhá.")
  .optional()
  .transform((value) => value ?? "")
  .refine((value) => value === "" || /^\d+([,.]\d{1,2})?$/.test(value), "Cena musí být číslo s maximálně dvěma desetinnými místy.")
  .transform((value) => (value === "" ? null : Math.round(Number(value.replace(",", ".")) * 100)))
  .pipe(z.number().int().min(0).max(10_000_000).nullable());

const integerInputSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "Hodnota musí být celé nezáporné číslo.")
  .transform((value) => Number(value))
  .pipe(z.number().int().min(0).max(1_000_000));

const signedIntegerInputSchema = z
  .string()
  .trim()
  .regex(/^-?\d+$/, "Množství musí být celé číslo.")
  .transform((value) => Number(value))
  .pipe(z.number().int().min(-1_000_000).max(1_000_000).refine((value) => value !== 0, "Množství nesmí být nula."));

export const inventoryProductSchema = z.object({
  currency: z.enum(["CZK", "EUR"]).default("CZK"),
  lowStockThreshold: integerInputSchema,
  name: z.string().trim().min(1, "Název produktu je povinný.").max(120, "Název produktu je příliš dlouhý."),
  purchasePrice: optionalPriceSchema,
  retailPrice: optionalPriceSchema,
  sku: z.string().trim().max(80, "SKU je příliš dlouhé.").optional().transform((value) => value || undefined),
  stockQuantity: integerInputSchema,
  unit: z.string().trim().min(1, "Jednotka je povinná.").max(24, "Jednotka je příliš dlouhá."),
});

export const inventoryMovementSchema = z.object({
  note: z.string().trim().max(500, "Poznámka je příliš dlouhá.").optional().transform((value) => value || undefined),
  productId: z.string().uuid(),
  quantityDelta: signedIntegerInputSchema,
  reason: z.enum(["purchase", "usage", "sale", "adjustment", "waste", "return"]),
});

export type InventoryProductInput = z.infer<typeof inventoryProductSchema>;
export type InventoryMovementInput = z.infer<typeof inventoryMovementSchema>;
