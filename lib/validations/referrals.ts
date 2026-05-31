import { z } from "zod";

const amountSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) return 0;
    return Math.round(Number(value.replace(",", ".")) * 100);
  })
  .pipe(z.number().int().min(0, "Odměna nesmí být záporná.").max(1_000_000, "Odměna je příliš vysoká."));

const optionalTextSchema = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().transform((value) => value || undefined);

export const referralProgramSchema = z.object({
  currency: z.enum(["CZK", "EUR"]),
  maxUsesPerCode: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return Number(value);
    })
    .pipe(z.number().int().min(1, "Limit použití musí být alespoň 1.").max(10_000, "Limit použití je příliš vysoký.").optional()),
  name: z.string().trim().min(1, "Název programu je povinný.").max(140, "Název programu je příliš dlouhý."),
  note: optionalTextSchema(500, "Poznámka je příliš dlouhá."),
  referredRewardAmount: amountSchema,
  referrerRewardAmount: amountSchema,
  rewardType: z.enum(["credit", "discount", "manual"]),
});

export const issueReferralCodeSchema = z.object({
  clientId: z.string().uuid().optional().or(z.literal("")).transform((value) => value || undefined),
  label: optionalTextSchema(140, "Štítek je příliš dlouhý."),
  programId: z.string().uuid("Vyberte referral program."),
});

export type ReferralProgramInput = z.infer<typeof referralProgramSchema>;
export type IssueReferralCodeInput = z.infer<typeof issueReferralCodeSchema>;
