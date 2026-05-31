import { describe, expect, it } from "vitest";

import { getNextBillingDate } from "@/lib/memberships/dates";
import {
  assignMembershipSchema,
  createMembershipPlanSchema,
  updateMembershipStatusSchema,
} from "@/lib/validations/memberships";

const UUID_1 = "11111111-1111-4111-8111-111111111111";
const UUID_2 = "22222222-2222-4222-8222-222222222222";

describe("membership dates", () => {
  it("pocita dalsi billing datum podle periody", () => {
    const start = new Date("2026-05-08T00:00:00.000Z");

    expect(getNextBillingDate(start, "monthly")).toBe("2026-06-08");
    expect(getNextBillingDate(start, "quarterly")).toBe("2026-08-08");
    expect(getNextBillingDate(start, "yearly")).toBe("2027-05-08");
  });
});

describe("membership validations", () => {
  it("normalizuje plan clenstvi", () => {
    const parsed = createMembershipPlanSchema.parse({
      billingPeriod: "monthly",
      currency: "CZK",
      description: " VIP ",
      includedCredit: "1000",
      includedUnits: "4",
      name: " Klub ",
      price: "1590,50",
    });

    expect(parsed).toEqual({
      billingPeriod: "monthly",
      currency: "CZK",
      description: "VIP",
      includedCredit: 100000,
      includedUnits: 4,
      name: "Klub",
      price: 159050,
    });
  });

  it("odmitne nulovou cenu clenstvi", () => {
    const parsed = createMembershipPlanSchema.safeParse({
      billingPeriod: "monthly",
      currency: "CZK",
      name: "Klub",
      price: "0",
    });

    expect(parsed.success).toBe(false);
  });

  it("validuje prirazeni clenstvi klientovi", () => {
    const parsed = assignMembershipSchema.parse({
      clientId: UUID_1,
      membershipPlanId: UUID_2,
      note: "",
      startsAt: "2026-05-08",
    });

    expect(parsed.note).toBeUndefined();
  });

  it("validuje zmenu stavu", () => {
    expect(updateMembershipStatusSchema.safeParse({ membershipId: UUID_1, status: "paused" }).success).toBe(true);
    expect(updateMembershipStatusSchema.safeParse({ membershipId: UUID_1, status: "deleted" }).success).toBe(false);
  });
});
