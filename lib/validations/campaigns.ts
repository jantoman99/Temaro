import { z } from "zod";

export const marketingCampaignSchema = z.object({
  channel: z.enum(["email", "sms"]),
  message: z.string().trim().min(1, "Zpráva je povinná.").max(1000, "Zpráva je příliš dlouhá."),
  name: z.string().trim().min(1, "Název kampaně je povinný.").max(120, "Název kampaně je příliš dlouhý."),
  scheduledAt: z.string().datetime().optional().or(z.literal("")).transform((value) => value || undefined),
  segment: z.enum(["all", "inactive_60d", "flagged", "no_show_risk", "last_visit_30d"]),
  subject: z.string().trim().max(120, "Předmět je příliš dlouhý.").optional().transform((value) => value || undefined),
});

const dateTimeLocalSchema = z
  .string()
  .trim()
  .min(1, "Čas je povinný.")
  .transform((value) => new Date(value).toISOString());

export const lastMinuteOfferSchema = z
  .object({
    discountPercent: z
      .string()
      .trim()
      .regex(/^\d+$/, "Sleva musí být celé číslo.")
      .transform((value) => Number(value))
      .pipe(z.number().int().min(0).max(90)),
    endsAt: dateTimeLocalSchema,
    note: z.string().trim().max(500, "Poznámka je příliš dlouhá.").optional().transform((value) => value || undefined),
    serviceId: z.string().uuid().optional().or(z.literal("")).transform((value) => value || undefined),
    staffId: z.string().uuid().optional().or(z.literal("")).transform((value) => value || undefined),
    startsAt: dateTimeLocalSchema,
  })
  .refine((value) => new Date(value.endsAt).getTime() > new Date(value.startsAt).getTime(), {
    message: "Konec nabídky musí být po začátku.",
    path: ["endsAt"],
  });

export type MarketingCampaignInput = z.infer<typeof marketingCampaignSchema>;
export type LastMinuteOfferInput = z.infer<typeof lastMinuteOfferSchema>;
