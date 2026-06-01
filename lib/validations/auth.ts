import { z } from "zod";

import { emailSchema } from "@/lib/validations/email";

const passwordSchema = z
  .string()
  .min(8, "Heslo musí mít alespoň 8 znaků.")
  .max(128, "Heslo je příliš dlouhé.");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  password: passwordSchema,
});

export const registerSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Název podniku musí mít alespoň 2 znaky.")
    .max(100, "Název podniku je příliš dlouhý."),
  fullName: z
    .string()
    .trim()
    .min(2, "Jméno musí mít alespoň 2 znaky.")
    .max(100, "Jméno je příliš dlouhé."),
  email: emailSchema,
  password: passwordSchema,
});

export const oauthBusinessRegistrationSchema = registerSchema.pick({
  businessName: true,
  fullName: true,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OauthBusinessRegistrationInput = z.infer<typeof oauthBusinessRegistrationSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
