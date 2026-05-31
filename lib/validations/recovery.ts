import { z } from "zod";

const optionalUuidSchema = z.string().uuid().optional().or(z.literal("")).transform((value) => value || undefined);

export const recoveryOfferSchema = z.object({
  discountPercent: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : 0))
    .pipe(z.number().int().min(0, "Sleva nesmí být záporná.").max(100, "Sleva nemůže být nad 100 %. ")),
  endsAt: z.string().datetime("Konec musí být platné datum a čas."),
  note: z.string().trim().max(500, "Poznámka je příliš dlouhá.").optional().transform((value) => value || undefined),
  serviceId: z.string().uuid("Vyberte službu."),
  staffId: optionalUuidSchema,
  startsAt: z.string().datetime("Začátek musí být platné datum a čas."),
}).superRefine((value, context) => {
  if (new Date(value.endsAt).getTime() <= new Date(value.startsAt).getTime()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Konec musí být po začátku.",
      path: ["endsAt"],
    });
  }
});

export const recoveryRecipientSchema = z.object({
  clientId: z.string().uuid("Vyberte klienta."),
  offerId: z.string().uuid("Vyberte nabídku."),
});

export type RecoveryOfferInput = z.infer<typeof recoveryOfferSchema>;
export type RecoveryRecipientInput = z.infer<typeof recoveryRecipientSchema>;
