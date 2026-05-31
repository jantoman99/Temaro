import { z } from "zod";

const optionalUuidSchema = z.string().uuid().optional().or(z.literal("")).transform((value) => value || undefined);
const optionalTextSchema = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().transform((value) => value || undefined);

export const groupClassSchema = z.object({
  capacity: z
    .string()
    .trim()
    .regex(/^\d+$/, "Kapacita musí být celé číslo.")
    .transform((value) => Number(value))
    .pipe(z.number().int().min(1, "Kapacita musí být alespoň 1.").max(1000, "Kapacita je příliš vysoká.")),
  currency: z.enum(["CZK", "EUR"]),
  endsAt: z.string().datetime("Konec lekce musí být platné datum a čas."),
  locationId: optionalUuidSchema,
  note: optionalTextSchema(500, "Poznámka je příliš dlouhá."),
  price: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return Math.round(Number(value.replace(",", ".")) * 100);
    })
    .pipe(z.number().int().min(0, "Cena nesmí být záporná.").max(10_000_000, "Cena je příliš vysoká.").optional()),
  resourceId: optionalUuidSchema,
  serviceId: z.string().uuid("Vyberte službu."),
  staffId: optionalUuidSchema,
  startsAt: z.string().datetime("Začátek lekce musí být platné datum a čas."),
  title: z.string().trim().min(1, "Název lekce je povinný.").max(140, "Název lekce je příliš dlouhý."),
}).superRefine((value, context) => {
  if (new Date(value.endsAt).getTime() <= new Date(value.startsAt).getTime()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Konec lekce musí být po začátku.",
      path: ["endsAt"],
    });
  }
});

export const groupClassEnrollmentSchema = z.object({
  clientId: z.string().uuid("Vyberte klienta."),
  groupClassId: z.string().uuid("Vyberte lekci."),
  note: optionalTextSchema(500, "Poznámka je příliš dlouhá."),
});

export type GroupClassInput = z.infer<typeof groupClassSchema>;
export type GroupClassEnrollmentInput = z.infer<typeof groupClassEnrollmentSchema>;
