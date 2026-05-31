import { z } from "zod";

export const resourceSchema = z.object({
  capacity: z
    .string()
    .trim()
    .regex(/^\d+$/, "Kapacita musí být celé číslo.")
    .transform((value) => Number(value))
    .pipe(z.number().int().min(1, "Kapacita musí být alespoň 1.").max(1000, "Kapacita je příliš vysoká.")),
  description: z.string().trim().max(500, "Popis je příliš dlouhý.").optional().transform((value) => value || undefined),
  name: z.string().trim().min(1, "Název zdroje je povinný.").max(120, "Název zdroje je příliš dlouhý."),
  resourceType: z.enum(["room", "chair", "equipment", "vehicle", "other"]),
});

export const serviceResourceSchema = z.object({
  resourceId: z.string().uuid(),
  serviceId: z.string().uuid(),
});

export type ResourceInput = z.infer<typeof resourceSchema>;
export type ServiceResourceInput = z.infer<typeof serviceResourceSchema>;
