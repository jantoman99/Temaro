import { describe, expect, it } from "vitest";

import { assignClientPassSchema, createPackageSchema, redeemClientPassSchema } from "@/lib/validations/packages";

const UUID_1 = "11111111-1111-4111-8111-111111111111";
const UUID_2 = "22222222-2222-4222-8222-222222222222";

describe("package validations", () => {
  it("normalizuje permanentku na vstupy", () => {
    const parsed = createPackageSchema.parse({
      currency: "CZK",
      name: " 10 vstupů ",
      packageType: "sessions",
      price: "4500",
      serviceId: UUID_1,
      totalUnits: "10",
      validityDays: "180",
    });

    expect(parsed).toEqual({
      creditAmount: undefined,
      currency: "CZK",
      name: "10 vstupů",
      packageType: "sessions",
      price: 450000,
      serviceId: UUID_1,
      totalUnits: 10,
      validityDays: 180,
    });
  });

  it("normalizuje kreditni balicek", () => {
    const parsed = createPackageSchema.parse({
      creditAmount: "2500,50",
      currency: "CZK",
      name: "Kredit",
      packageType: "credit",
      price: "2000",
      serviceId: "",
      totalUnits: "",
      validityDays: "",
    });

    expect(parsed.creditAmount).toBe(250050);
    expect(parsed.price).toBe(200000);
    expect(parsed.serviceId).toBeUndefined();
    expect(parsed.totalUnits).toBeNull();
    expect(parsed.validityDays).toBeNull();
  });

  it("odmitne permanentku bez poctu vstupu", () => {
    const parsed = createPackageSchema.safeParse({
      currency: "CZK",
      name: "Permanentka",
      packageType: "sessions",
      price: "1000",
      totalUnits: "",
      validityDays: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("validuje prirazeni klientovi", () => {
    const parsed = assignClientPassSchema.parse({
      clientId: UUID_1,
      packageId: UUID_2,
      note: " VIP ",
    });

    expect(parsed.note).toBe("VIP");
  });

  it("validuje cerpani vstupu a kreditu", () => {
    const sessions = redeemClientPassSchema.safeParse({
      clientPassId: UUID_1,
      creditUsed: undefined,
      unitsUsed: "1",
      usageType: "sessions",
    });
    const credit = redeemClientPassSchema.safeParse({
      clientPassId: UUID_1,
      creditUsed: "500",
      unitsUsed: "",
      usageType: "credit",
    });
    const invalid = redeemClientPassSchema.safeParse({
      clientPassId: UUID_1,
      unitsUsed: "",
      usageType: "sessions",
    });

    expect(sessions.success).toBe(true);
    expect(credit.success).toBe(true);
    expect(invalid.success).toBe(false);
  });
});
