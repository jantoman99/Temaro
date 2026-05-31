import { z } from "zod";

import { CLIENT_FLAG_REASON_MAX_LENGTH, CLIENT_NOTES_MAX_LENGTH } from "@/lib/client-form-limits";
import { normalizePhoneInput } from "@/lib/phone";
import { optionalEmailSchema } from "@/lib/validations/email";

const optionalUuidSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .pipe(z.string().uuid("Vyberte platného zaměstnance.").optional());

const optionalTextSchema = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional();

const optionalPhoneSchema = z
  .string()
  .transform(normalizePhoneInput)
  .transform((value) => (value.length > 0 ? value : undefined))
  .pipe(
    z
      .string()
      .regex(/^\+?[0-9]{9,20}$/, "Telefon musí mít 9 až 20 číslic a může začínat znakem +.")
      .optional(),
  )
  .optional();

const formBooleanSchema = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => value === true || value === "true");

const clientFieldsSchema = z.object({
  clientTier: z.enum(["standard", "trusted", "risk"]).default("standard"),
  fullName: z.string().trim().min(2, "Jméno musí mít alespoň 2 znaky.").max(100),
  phone: optionalPhoneSchema,
  email: optionalEmailSchema,
  notes: optionalTextSchema(CLIENT_NOTES_MAX_LENGTH),
  preferenceNotes: optionalTextSchema(500),
  preferredContactChannel: z.enum(["any", "email", "sms", "phone"]).default("any"),
  preferredStaffId: optionalUuidSchema,
  preferredTimeOfDay: z.enum(["any", "morning", "afternoon", "evening"]).default("any"),
});

export const createClientSchema = clientFieldsSchema;

export const clientIdSchema = z.object({
  clientId: z.string().uuid(),
});

export const updateClientSchema = clientFieldsSchema.extend({
  clientId: z.string().uuid(),
});

export const flagClientSchema = z.object({
  clientId: z.string().uuid(),
  isFlagged: formBooleanSchema,
  flagReason: optionalTextSchema(CLIENT_FLAG_REASON_MAX_LENGTH),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
