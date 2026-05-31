import { z } from "zod";

import { PRICE_INPUT_MAX_LENGTH } from "@/lib/price-input";
import {
  isServiceTimeStepAligned,
  SERVICE_DESCRIPTION_MAX_LENGTH,
  SERVICE_NAME_MAX_LENGTH,
  SERVICE_TIME_STEP_MINUTES,
} from "@/lib/service-form-limits";
import { integerFormValueSchema } from "@/lib/validations/number";

const priceSchema = z
  .string()
  .trim()
  .max(PRICE_INPUT_MAX_LENGTH, "Cena je příliš dlouhá.")
  .regex(/^\d+([,.]\d{1,2})?$/, "Cena musí být číslo s maximálně dvěma desetinnými místy.")
  .transform((value) => Math.round(Number(value.replace(",", ".")) * 100))
  .pipe(z.number().int().min(0).max(1_000_000));

const depositValueSchema = z
  .string()
  .trim()
  .max(PRICE_INPUT_MAX_LENGTH, "Záloha je příliš dlouhá.")
  .optional()
  .default("");

const durationMinutesSchema = integerFormValueSchema("Délka služby musí být celé číslo.").pipe(
  z.number().int().min(5).max(1440),
);

const bufferMinutesSchema = integerFormValueSchema("Buffer musí být celé číslo.").pipe(
  z.number().int().min(0).max(240),
);

const serviceFieldsBaseSchema = z.object({
  name: z.string().trim().min(2, "Název musí mít alespoň 2 znaky.").max(SERVICE_NAME_MAX_LENGTH),
  description: z
    .string()
    .trim()
    .max(SERVICE_DESCRIPTION_MAX_LENGTH)
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
  durationMinutes: durationMinutesSchema.refine(
    isServiceTimeStepAligned,
    `Délka služby musí být v násobcích ${SERVICE_TIME_STEP_MINUTES} minut.`,
  ),
  price: priceSchema,
  currency: z.enum(["CZK", "EUR"]).default("CZK"),
  bufferMinutes: bufferMinutesSchema
    .refine(isServiceTimeStepAligned, `Buffer musí být v násobcích ${SERVICE_TIME_STEP_MINUTES} minut.`)
    .default(0),
  depositType: z.enum(["none", "fixed", "percent"]).default("none"),
  depositValue: depositValueSchema,
});

function normalizeServiceSchema<T extends typeof serviceFieldsBaseSchema>(schema: T) {
  return schema.superRefine((data, context) => {
  if (data.depositType === "none") {
    return;
  }

  if (!data.depositValue) {
    context.addIssue({
      code: "custom",
      message: "Vyplňte hodnotu zálohy.",
      path: ["depositValue"],
    });
    return;
  }

  if (data.depositType === "fixed" && !/^\d+([,.]\d{1,2})?$/.test(data.depositValue)) {
    context.addIssue({
      code: "custom",
      message: "Fixní záloha musí být částka s maximálně dvěma desetinnými místy.",
      path: ["depositValue"],
    });
    return;
  }

  if (data.depositType === "percent" && !/^\d+$/.test(data.depositValue)) {
    context.addIssue({
      code: "custom",
      message: "Procentní záloha musí být celé číslo.",
      path: ["depositValue"],
    });
    return;
  }

  const depositValue = data.depositType === "fixed"
    ? Math.round(Number(data.depositValue.replace(",", ".")) * 100)
    : Number(data.depositValue);

  if (data.depositType === "fixed" && (depositValue <= 0 || depositValue > data.price)) {
    context.addIssue({
      code: "custom",
      message: "Fixní záloha musí být vyšší než 0 a nesmí překročit cenu služby.",
      path: ["depositValue"],
    });
  }

  if (data.depositType === "percent" && (depositValue <= 0 || depositValue > 100)) {
    context.addIssue({
      code: "custom",
      message: "Procentní záloha musí být v rozsahu 1 až 100.",
      path: ["depositValue"],
    });
  }
  }).transform((data) => ({
  ...data,
  depositValue: data.depositType === "none"
    ? 0
    : data.depositType === "fixed"
      ? Math.round(Number(data.depositValue.replace(",", ".")) * 100)
      : Number(data.depositValue),
  }));
}

export const createServiceSchema = normalizeServiceSchema(serviceFieldsBaseSchema);

export const serviceIdSchema = z.object({
  serviceId: z.string().uuid(),
});

export const updateServiceSchema = normalizeServiceSchema(serviceFieldsBaseSchema.extend({
  serviceId: z.string().uuid(),
  durationMinutes: durationMinutesSchema,
  bufferMinutes: bufferMinutesSchema.default(0),
}));

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
