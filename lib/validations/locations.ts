import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((value) => value || undefined);

const optionalCoordinate = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .refine((value) => value === "" || /^-?\d+([,.]\d+)?$/.test(value), `${label} musí být číslo.`)
    .transform((value) => (value === "" ? null : Number(value.replace(",", "."))))
    .pipe(z.number().min(min).max(max).nullable());

export const tenantLocationSchema = z
  .object({
    address: optionalText(180),
    city: optionalText(90),
    countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Země musí být dvoupísmenný ISO kód."),
    email: z.string().trim().email("E-mail není validní.").max(254).optional().or(z.literal("")).transform((value) => value || undefined),
    isPrimary: z.boolean().default(false),
    latitude: optionalCoordinate("Zeměpisná šířka", -90, 90),
    longitude: optionalCoordinate("Zeměpisná délka", -180, 180),
    name: z.string().trim().min(1, "Název pobočky je povinný.").max(120, "Název pobočky je příliš dlouhý."),
    phone: optionalText(40),
    postalCode: optionalText(20),
    region: optionalText(90),
  })
  .refine(
    (value) => (value.latitude === null && value.longitude === null) || (value.latitude !== null && value.longitude !== null),
    {
      message: "Vyplňte zeměpisnou šířku i délku, nebo nechte obě hodnoty prázdné.",
      path: ["latitude"],
    },
  );

export type TenantLocationInput = z.infer<typeof tenantLocationSchema>;
