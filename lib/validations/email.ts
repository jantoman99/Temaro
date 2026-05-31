import { z } from "zod";

const EMAIL_MAX_LENGTH = 254;
const EMAIL_TOO_LONG_MESSAGE = "Email je příliš dlouhý.";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(EMAIL_MAX_LENGTH, EMAIL_TOO_LONG_MESSAGE)
  .email("Zadejte platný email.");

export const optionalEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value) => (value.length > 0 ? value : undefined))
  .pipe(emailSchema.optional());

export const nullableEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value) => (value.length > 0 ? value : null))
  .pipe(emailSchema.nullable());

