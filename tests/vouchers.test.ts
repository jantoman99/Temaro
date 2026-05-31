import { describe, expect, it } from "vitest";

import { createVoucherSchema, redeemVoucherSchema } from "@/lib/validations/vouchers";
import { formatVoucherCode, getVoucherCodeLast4, hashVoucherCode, normalizeVoucherCode } from "@/lib/vouchers/code";

describe("voucher code helpers", () => {
  it("normalizuje a formatuje kod bez ulozeni raw hodnoty", () => {
    expect(normalizeVoucherCode("ab12-cd34")).toBe("AB12CD34");
    expect(formatVoucherCode("ab12cd34ef56")).toBe("AB12-CD34-EF56");
    expect(getVoucherCodeLast4("ab12-cd34")).toBe("CD34");
    expect(hashVoucherCode("ab12-cd34")).toBe(hashVoucherCode("AB12CD34"));
  });
});

describe("voucher validations", () => {
  it("normalizuje vystaveni voucheru a cenu uklada v halerich", () => {
    const parsed = createVoucherSchema.parse({
      amount: "1500,50",
      currency: "CZK",
      expiresAt: "2026-12-31",
      issuedToEmail: "klient@example.com",
      issuedToName: " Klient ",
      label: " Dárkový voucher ",
      note: "",
    });

    expect(parsed).toEqual({
      amount: 150050,
      currency: "CZK",
      expiresAt: "2026-12-31",
      issuedToEmail: "klient@example.com",
      issuedToName: "Klient",
      label: "Dárkový voucher",
      note: undefined,
    });
  });

  it("odmitne nevalidni castku voucheru", () => {
    expect(createVoucherSchema.safeParse({ amount: "0", currency: "CZK", label: "Voucher" }).success).toBe(false);
  });

  it("normalizuje cerpani voucheru a odmita kratky kod", () => {
    const valid = redeemVoucherSchema.safeParse({
      amount: "300",
      code: "ab12-cd34-ef56",
      note: "Doplatek",
    });
    const invalid = redeemVoucherSchema.safeParse({
      amount: "300",
      code: "abc",
    });

    expect(valid.success).toBe(true);
    expect(valid.data?.code).toBe("AB12CD34EF56");
    expect(invalid.success).toBe(false);
  });
});
