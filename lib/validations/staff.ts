import { z } from "zod";

import { STAFF_BIO_MAX_LENGTH, STAFF_EXCEPTION_NOTE_MAX_LENGTH } from "@/lib/staff-form-limits";
import { emailSchema } from "@/lib/validations/email";
import { integerFormValueSchema } from "@/lib/validations/number";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Čas musí být ve formátu HH:MM.");

const staffBaseSchema = z.object({
  name: z.string().trim().min(2, "Jméno musí mít alespoň 2 znaky.").max(100),
  bio: z
    .string()
    .trim()
    .max(STAFF_BIO_MAX_LENGTH)
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Barva musí být HEX ve formátu #RRGGBB.")
    .default("#111827"),
});

const workingDaysSchema = z
  .array(
    integerFormValueSchema("Pracovní den musí být celé číslo.").pipe(
      z.number().int().min(0).max(6),
    ),
  )
  .transform((days) => [...new Set(days)].sort((a, b) => a - b))
  .pipe(z.array(z.number().int().min(0).max(6)).min(1, "Vyberte alespoň jeden pracovní den."));

export const createStaffSchema = staffBaseSchema
  .extend({
    workingDays: workingDaysSchema,
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((value) => value.startTime < value.endTime, {
    path: ["endTime"],
    message: "Konec pracovní doby musí být po začátku.",
  });

export const updateStaffSchema = staffBaseSchema
  .extend({
    staffId: z.string().uuid(),
    workingDays: workingDaysSchema,
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((value) => value.startTime < value.endTime, {
    path: ["endTime"],
    message: "Konec pracovní doby musí být po začátku.",
  });

export const staffIdSchema = z.object({
  staffId: z.string().uuid(),
});

export const updateStaffColorSchema = z.object({
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Barva musí být HEX ve formátu #RRGGBB."),
  staffId: z.string().uuid(),
});

export const staffServiceSchema = z.object({
  staffId: z.string().uuid(),
  serviceId: z.string().uuid(),
});

export const inviteStaffSchema = z.object({
  fullName: z.string().trim().min(2, "Jméno musí mít alespoň 2 znaky.").max(100),
  email: emailSchema,
  staffId: z.string().uuid("Vyberte zaměstnance, kterého chcete propojit s účtem."),
});

const optionalTimeSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .pipe(timeSchema.nullable());

const formBooleanSchema = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => value === true || value === "true");

export const staffExceptionSchema = z
  .object({
    staffId: z.string().uuid(),
    date: z.string().date(),
    isWorking: formBooleanSchema,
    startTime: optionalTimeSchema,
    endTime: optionalTimeSchema,
    note: z
      .string()
      .trim()
      .max(STAFF_EXCEPTION_NOTE_MAX_LENGTH)
      .transform((value) => (value.length > 0 ? value : null))
      .optional(),
  })
  .refine(
    (value) => {
      if (!value.isWorking) {
        return value.startTime === null && value.endTime === null;
      }

      return Boolean(value.startTime && value.endTime && value.startTime < value.endTime);
    },
    {
      path: ["endTime"],
      message: "Pro pracovní výjimku vyplňte platný čas od-do. Pro volno nechte časy prázdné.",
    },
  );

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;
export type UpdateStaffColorInput = z.infer<typeof updateStaffColorSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
