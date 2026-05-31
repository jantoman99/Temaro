import { z } from "zod";

import {
  CANCELLATION_NOTICE_HOURS_MAX,
  CANCELLATION_NOTICE_HOURS_MIN,
  TENANT_NAME_MAX_LENGTH,
} from "@/lib/settings-form-limits";
import { TENANT_INDUSTRIES } from "@/lib/tenant-industry";
import { integerFormValueSchema } from "@/lib/validations/number";

const tenantIndustryValues = TENANT_INDUSTRIES.map((industry) => industry.value) as [
  (typeof TENANT_INDUSTRIES)[number]["value"],
  ...(typeof TENANT_INDUSTRIES)[number]["value"][],
];

export const tenantIndustrySchema = z.enum(tenantIndustryValues);

const optionalUrlSchema = z
  .string()
  .trim()
  .max(500, "URL může mít maximálně 500 znaků.")
  .optional()
  .transform((value) => value || null)
  .pipe(z.string().url("Zadejte platnou URL adresu.").nullable());

const optionalCoordinateSchema = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .refine((value) => value === "" || /^-?\d+([,.]\d+)?$/.test(value), `${label} musí být číslo.`)
    .transform((value) => (value === "" ? null : Number(value.replace(",", "."))))
    .pipe(z.number().min(min, `${label} je mimo povolený rozsah.`).max(max, `${label} je mimo povolený rozsah.`).nullable());

export const tenantSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Název musí mít alespoň 2 znaky.")
    .max(TENANT_NAME_MAX_LENGTH)
    .refine((value) => !/[\p{Cc}\p{Cf}]/u.test(value), "Název obsahuje nepovolené řídicí znaky."),
  timezone: z.enum(["Europe/Prague", "Europe/Bratislava", "UTC"]),
  locale: z.enum(["cs", "sk", "en"]),
  defaultCurrency: z.enum(["CZK", "EUR"]),
  industry: tenantIndustrySchema.default("hair"),
  cancellationNoticeHours: integerFormValueSchema("Storno lhůta musí být celé číslo.")
    .pipe(
      z
        .number()
        .min(CANCELLATION_NOTICE_HOURS_MIN, "Storno lhůta nemůže být záporná.")
        .max(CANCELLATION_NOTICE_HOURS_MAX, "Storno lhůta může být maximálně 168 hodin."),
    ),
  publicAddress: z
    .string()
    .trim()
    .max(180, "Adresa může mít maximálně 180 znaků.")
    .optional()
    .transform((value) => value || null),
  publicCity: z
    .string()
    .trim()
    .max(90, "Město může mít maximálně 90 znaků.")
    .optional()
    .transform((value) => value || null),
  publicRegion: z
    .string()
    .trim()
    .max(90, "Kraj nebo lokalita může mít maximálně 90 znaků.")
    .optional()
    .transform((value) => value || null),
  publicPostalCode: z
    .string()
    .trim()
    .max(20, "PSČ může mít maximálně 20 znaků.")
    .optional()
    .transform((value) => value || null),
  publicCountryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Země musí být dvoupísmenný ISO kód.")
    .default("CZ"),
  publicMapUrl: optionalUrlSchema,
  publicLatitude: optionalCoordinateSchema("Zeměpisná šířka", -90, 90),
  publicLongitude: optionalCoordinateSchema("Zeměpisná délka", -180, 180),
  reviewUrl: optionalUrlSchema,
  reviewRating: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .refine((value) => value === "" || /^\d([,.]\d)?$/.test(value), "Hodnocení musí být číslo s maximálně jedním desetinným místem.")
    .transform((value) => (value === "" ? null : Number(value.replace(",", "."))))
    .pipe(z.number().min(0, "Hodnocení nemůže být záporné.").max(5, "Hodnocení může být maximálně 5.").nullable()),
  reviewCount: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || "0")
    .pipe(integerFormValueSchema("Počet recenzí musí být celé číslo."))
    .pipe(z.number().min(0, "Počet recenzí nemůže být záporný.").max(100000, "Počet recenzí je příliš vysoký.")),
  reviewSourceLabel: z
    .string()
    .trim()
    .max(80, "Zdroj recenzí může mít maximálně 80 znaků.")
    .optional()
    .transform((value) => value || null),
  isPubliclyListed: z.boolean().default(false),
}).refine(
  (value) => (value.publicLatitude === null && value.publicLongitude === null) || (value.publicLatitude !== null && value.publicLongitude !== null),
  {
    message: "Vyplňte zeměpisnou šířku i délku, nebo nechte obě hodnoty prázdné.",
    path: ["publicLatitude"],
  },
).refine(
  (value) => value.reviewRating === null || value.reviewCount > 0,
  {
    message: "Pokud vyplníte hodnocení, počet recenzí musí být větší než nula.",
    path: ["reviewCount"],
  },
);

export type TenantSettingsInput = z.infer<typeof tenantSettingsSchema>;

export const tenantBookingBrandingSchema = z.object({
  publicDescription: z
    .string()
    .trim()
    .max(280, "Popis může mít maximálně 280 znaků.")
    .optional()
    .transform((value) => value || null),
  logoUrl: optionalUrlSchema,
  coverImageUrl: optionalUrlSchema,
  brandColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Barva musí být HEX ve formátu #RRGGBB."),
  confirmationMessage: z
    .string()
    .trim()
    .max(500, "Text potvrzení může mít maximálně 500 znaků.")
    .optional()
    .transform((value) => value || null),
  reminderMessage: z
    .string()
    .trim()
    .max(500, "Text připomínky může mít maximálně 500 znaků.")
    .optional()
    .transform((value) => value || null),
  cancellationMessage: z
    .string()
    .trim()
    .max(500, "Text zrušení může mít maximálně 500 znaků.")
    .optional()
    .transform((value) => value || null),
});

export type TenantBookingBrandingInput = z.infer<typeof tenantBookingBrandingSchema>;
