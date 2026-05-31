import { describe, expect, it } from "vitest";

import { getPaidTotal, getPosPaymentScope, getRemainingAmount } from "@/lib/pos/checkout";
import { posCheckoutSchema } from "@/lib/validations/payments";

describe("POS checkout", () => {
  it("spocita doplatek podle zaplacenych plateb", () => {
    const booking = {
      payments: [
        { amount: 20000, status: "paid" },
        { amount: 50000, status: "pending" },
      ],
      servicePrice: 90000,
    };

    expect(getPaidTotal(booking.payments)).toBe(20000);
    expect(getRemainingAmount(booking)).toBe(70000);
    expect(getPosPaymentScope(booking)).toBe("remaining");
  });

  it("nevrati zaporny doplatek pri preplatku", () => {
    expect(getRemainingAmount({ payments: [{ amount: 120000, status: "paid" }], servicePrice: 90000 })).toBe(0);
  });

  it("validuje POS checkout vstup", () => {
    const parsed = posCheckoutSchema.safeParse({
      bookingId: "11111111-1111-4111-8111-111111111111",
      method: "cash",
      note: "Doplaceno na miste",
    });

    expect(parsed.success).toBe(true);
    expect(posCheckoutSchema.safeParse({ bookingId: "bad", method: "cash" }).success).toBe(false);
  });
});
