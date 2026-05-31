import { z } from "zod";

import {
  PUBLIC_BOOKING_SOURCE_VALUES,
  type PublicBookingSource,
} from "@/lib/booking/source";
import {
  BOOKING_CANCELLATION_REASON_MAX_LENGTH,
  BOOKING_NOTE_MAX_LENGTH,
} from "@/lib/booking-form-limits";
import { normalizePhoneInput } from "@/lib/phone";
import { nullableEmailSchema } from "@/lib/validations/email";

const optionalUuidSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .pipe(z.string().uuid().nullable());

const optionalPhoneSchema = z
  .string()
  .transform(normalizePhoneInput)
  .transform((value) => (value.length > 0 ? value : null))
  .pipe(
    z
      .string()
      .regex(/^\+?[0-9]{9,20}$/, "Telefon musí mít 9 až 20 číslic a může začínat znakem +.")
      .nullable(),
  )
  .optional();

const formBooleanSchema = z
  .union([z.boolean(), z.enum(["true", "false", "on"])])
  .transform((value) => value === true || value === "true" || value === "on");
const bookingDateTimeSchema = z.string().datetime("Vyberte platný termín.");
const publicBookingSourceSchema = z.enum(PUBLIC_BOOKING_SOURCE_VALUES);
const optionalTrackingTextSchema = z
  .string()
  .trim()
  .max(120)
  .transform((value) => (value.length > 0 ? value : null))
  .optional();

export const publicTenantSlugSchema = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/);

export const createBookingSchema = z.object({
  clientId: optionalUuidSchema,
  clientEmail: z
    .union([nullableEmailSchema, z.null()])
    .transform((value) => value ?? null)
    .optional(),
  clientFullName: z
    .string()
    .trim()
    .max(100)
    .transform((value) => (value.length > 0 ? value : null))
    .optional(),
  clientPhone: z
    .union([optionalPhoneSchema, z.null()])
    .transform((value) => value ?? null)
    .optional(),
  staffId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: bookingDateTimeSchema,
  sendNotification: formBooleanSchema.default(true),
  notes: z
    .string()
    .trim()
    .max(BOOKING_NOTE_MAX_LENGTH)
    .transform((value) => (value.length > 0 ? value : null))
    .optional(),
}).superRefine((data, ctx) => {
  if (data.clientId) {
    return;
  }

  const hasAnyNewClientField = Boolean(data.clientFullName || data.clientPhone || data.clientEmail);

  if (!hasAnyNewClientField) {
    return;
  }

  if (!data.clientFullName || data.clientFullName.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pro nového klienta vyplňte jméno alespoň o 2 znacích.",
      path: ["clientFullName"],
    });
  }
});

export const createPublicBookingSchema = z.object({
  slug: publicTenantSlugSchema,
  serviceId: z.string().uuid(),
  staffId: z.string().uuid(),
  startsAt: bookingDateTimeSchema,
  clientName: z.string().trim().min(2, "Jméno musí mít alespoň 2 znaky.").max(100),
  clientPhone: z
    .union([optionalPhoneSchema, z.null()])
    .transform((value) => value ?? null)
    .optional(),
  clientEmail: z
    .union([nullableEmailSchema, z.null()])
    .transform((value) => value ?? null)
    .optional(),
  notes: z
    .string()
    .trim()
    .max(BOOKING_NOTE_MAX_LENGTH)
    .transform((value) => (value.length > 0 ? value : null))
    .optional(),
  source: publicBookingSourceSchema.default("online" satisfies PublicBookingSource),
  sourceDetail: optionalTrackingTextSchema,
  utmSource: optionalTrackingTextSchema,
  utmMedium: optionalTrackingTextSchema,
  utmCampaign: optionalTrackingTextSchema,
  utmTerm: optionalTrackingTextSchema,
  utmContent: optionalTrackingTextSchema,
  ref: optionalTrackingTextSchema,
});

export const createWaitlistEntrySchema = z.object({
  slug: publicTenantSlugSchema,
  serviceId: z.string().uuid(),
  staffId: optionalUuidSchema,
  clientName: z.string().trim().min(2, "Jméno musí mít alespoň 2 znaky.").max(100),
  clientPhone: z
    .union([optionalPhoneSchema, z.null()])
    .transform((value) => value ?? null)
    .optional(),
  clientEmail: z
    .union([nullableEmailSchema, z.null()])
    .transform((value) => value ?? null)
    .optional(),
  notes: z
    .string()
    .trim()
    .max(BOOKING_NOTE_MAX_LENGTH)
    .transform((value) => (value.length > 0 ? value : null))
    .optional(),
  source: publicBookingSourceSchema.default("online" satisfies PublicBookingSource),
  sourceDetail: optionalTrackingTextSchema,
  utmSource: optionalTrackingTextSchema,
  utmMedium: optionalTrackingTextSchema,
  utmCampaign: optionalTrackingTextSchema,
  utmTerm: optionalTrackingTextSchema,
  utmContent: optionalTrackingTextSchema,
  ref: optionalTrackingTextSchema,
}).superRefine((data, ctx) => {
  if (data.clientPhone || data.clientEmail) {
    return;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: "Pro čekací listinu vyplňte telefon nebo e-mail.",
    path: ["clientPhone"],
  });
});

export const bookingIdSchema = z.object({
  bookingId: z.string().uuid(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
  cancellationReason: z
    .string()
    .trim()
    .max(BOOKING_CANCELLATION_REASON_MAX_LENGTH)
    .transform((value) => (value.length > 0 ? value : null))
    .optional(),
});

export const bookingManageTokenSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
});

export const rescheduleManagedBookingSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  staffId: z.string().uuid(),
  startsAt: bookingDateTimeSchema,
});

export const updateBookingSchema = z.object({
  bookingId: z.string().uuid(),
  staffId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: bookingDateTimeSchema,
  notes: z
    .string()
    .trim()
    .max(BOOKING_NOTE_MAX_LENGTH)
    .transform((value) => (value.length > 0 ? value : null))
    .optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreatePublicBookingInput = z.infer<typeof createPublicBookingSchema>;
export type CreateWaitlistEntryInput = z.infer<typeof createWaitlistEntrySchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
