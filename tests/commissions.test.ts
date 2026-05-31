import { describe, expect, it } from "vitest";

import { calculateEstimatedCommission } from "@/lib/commissions/calculate";
import { commissionRuleSchema } from "@/lib/validations/commissions";

const UUID = "11111111-1111-4111-8111-111111111111";

describe("commissions", () => {
  it("spocita procentni provizi ze zaplacenych plateb", () => {
    expect(calculateEstimatedCommission({
      completedBookings: 3,
      paidRevenue: 100000,
      rule: {
        currency: "CZK",
        fixed_amount: 0,
        is_active: true,
        percent_bps: 1500,
        rule_type: "percent_paid_revenue",
      },
    })).toBe(15000);
  });

  it("spocita fixni provizi za hotove rezervace", () => {
    expect(calculateEstimatedCommission({
      completedBookings: 3,
      paidRevenue: 100000,
      rule: {
        currency: "CZK",
        fixed_amount: 5000,
        is_active: true,
        percent_bps: 0,
        rule_type: "fixed_completed_booking",
      },
    })).toBe(15000);
  });

  it("validuje provizni pravidlo", () => {
    const parsed = commissionRuleSchema.parse({
      currency: "CZK",
      fixedAmount: "",
      note: " Provize pro seniora ",
      percent: "15,5",
      ruleType: "percent_paid_revenue",
      staffId: UUID,
    });

    expect(parsed).toEqual({
      currency: "CZK",
      fixedAmount: 0,
      note: "Provize pro seniora",
      percent: 1550,
      ruleType: "percent_paid_revenue",
      staffId: UUID,
    });
  });
});
