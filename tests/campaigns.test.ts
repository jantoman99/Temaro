import { describe, expect, it } from "vitest";

import { lastMinuteOfferSchema, marketingCampaignSchema } from "@/lib/validations/campaigns";

const UUID_1 = "11111111-1111-4111-8111-111111111111";
const UUID_2 = "22222222-2222-4222-8222-222222222222";

describe("campaign validations", () => {
  it("normalizuje marketingovou kampan", () => {
    const parsed = marketingCampaignSchema.parse({
      channel: "email",
      message: " Přijďte znovu ",
      name: " Návrat klientů ",
      scheduledAt: "",
      segment: "inactive_60d",
      subject: " Akce ",
    });

    expect(parsed).toEqual({
      channel: "email",
      message: "Přijďte znovu",
      name: "Návrat klientů",
      scheduledAt: undefined,
      segment: "inactive_60d",
      subject: "Akce",
    });
  });

  it("odmitne prazdnou zpravu kampane", () => {
    const parsed = marketingCampaignSchema.safeParse({
      channel: "sms",
      message: "",
      name: "SMS",
      segment: "all",
    });

    expect(parsed.success).toBe(false);
  });

  it("validuje last minute nabidku", () => {
    const parsed = lastMinuteOfferSchema.parse({
      discountPercent: "20",
      endsAt: "2026-05-08T15:00",
      note: "",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-05-08T14:00",
    });

    expect(parsed.discountPercent).toBe(20);
    expect(parsed.note).toBeUndefined();
    expect(parsed.serviceId).toBe(UUID_1);
    expect(parsed.staffId).toBe(UUID_2);
  });

  it("odmitne last minute konec pred zacatkem", () => {
    const parsed = lastMinuteOfferSchema.safeParse({
      discountPercent: "10",
      endsAt: "2026-05-08T13:00",
      startsAt: "2026-05-08T14:00",
    });

    expect(parsed.success).toBe(false);
  });
});
