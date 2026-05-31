import { z } from "zod";

export const commissionRuleSchema = z
  .object({
    currency: z.enum(["CZK", "EUR"]),
    fixedAmount: z
      .string()
      .trim()
      .optional()
      .transform((value) => {
        if (!value) return 0;
        return Math.round(Number(value.replace(",", ".")) * 100);
      })
      .pipe(z.number().int().min(0, "Fixní provize nesmí být záporná.").max(1_000_000, "Fixní provize je příliš vysoká.")),
    note: z.string().trim().max(500, "Poznámka je příliš dlouhá.").optional().transform((value) => value || undefined),
    percent: z
      .string()
      .trim()
      .optional()
      .transform((value) => {
        if (!value) return 0;
        return Math.round(Number(value.replace(",", ".")) * 100);
      })
      .pipe(z.number().int().min(0, "Procento nesmí být záporné.").max(10_000, "Procento nemůže být nad 100 %. ")),
    ruleType: z.enum(["percent_paid_revenue", "fixed_completed_booking"]),
    staffId: z.string().uuid("Vyberte člena týmu."),
  })
  .superRefine((value, context) => {
    if (value.ruleType === "percent_paid_revenue" && value.percent <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "U procentní provize vyplňte procento.",
        path: ["percent"],
      });
    }

    if (value.ruleType === "fixed_completed_booking" && value.fixedAmount <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "U fixní provize vyplňte částku.",
        path: ["fixedAmount"],
      });
    }
  });

export type CommissionRuleInput = z.infer<typeof commissionRuleSchema>;
