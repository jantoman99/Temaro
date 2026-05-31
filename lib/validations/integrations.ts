import { z } from "zod";

export const apiKeyNameSchema = z.object({
  name: z.string().trim().min(1, "Zadejte název klíče.").max(80, "Název klíče je příliš dlouhý."),
});

export const apiKeyIdSchema = z.string().uuid("Neplatný API klíč.");

export const partnerBookingsQuerySchema = z.object({
  from: z.string().datetime("Neplatný začátek období.").optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  to: z.string().datetime("Neplatný konec období.").optional(),
}).superRefine((value, context) => {
  if (value.from && value.to && new Date(value.to).getTime() <= new Date(value.from).getTime()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Konec období musí být po začátku.",
      path: ["to"],
    });
  }
});

export type PartnerBookingsQuery = z.infer<typeof partnerBookingsQuerySchema>;
