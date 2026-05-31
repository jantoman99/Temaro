import { describe, expect, it } from "vitest";

import { formatReferralCode, getReferralCodeLast4, hashReferralCode, normalizeReferralCode } from "@/lib/referrals/code";
import { issueReferralCodeSchema, referralProgramSchema } from "@/lib/validations/referrals";

const UUID = "11111111-1111-4111-8111-111111111111";

describe("referrals", () => {
  it("normalizuje a hashuje referral kod", () => {
    expect(normalizeReferralCode(" abcd-1234 ")).toBe("ABCD1234");
    expect(formatReferralCode("abcd1234")).toBe("ABCD-1234");
    expect(getReferralCodeLast4("abcd-1234")).toBe("1234");
    expect(hashReferralCode("abcd-1234")).toBe(hashReferralCode("ABCD1234"));
  });

  it("validuje referral program", () => {
    const parsed = referralProgramSchema.parse({
      currency: "CZK",
      maxUsesPerCode: "5",
      name: " Doporuč kamaráda ",
      note: " Interní pravidla ",
      referredRewardAmount: "50",
      referrerRewardAmount: "100,50",
      rewardType: "credit",
    });

    expect(parsed).toEqual({
      currency: "CZK",
      maxUsesPerCode: 5,
      name: "Doporuč kamaráda",
      note: "Interní pravidla",
      referredRewardAmount: 5000,
      referrerRewardAmount: 10050,
      rewardType: "credit",
    });
  });

  it("validuje vydani referral kodu", () => {
    expect(issueReferralCodeSchema.parse({ clientId: "", label: "", programId: UUID })).toEqual({
      clientId: undefined,
      label: undefined,
      programId: UUID,
    });
  });
});
