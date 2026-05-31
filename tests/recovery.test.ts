import { describe, expect, it } from "vitest";

import { recoveryOfferSchema, recoveryRecipientSchema } from "@/lib/validations/recovery";

const UUID = "11111111-1111-4111-8111-111111111111";

describe("empty-slot recovery validations", () => {
  it("validuje recovery nabidku a normalizuje volitelna pole", () => {
    const parsed = recoveryOfferSchema.parse({
      discountPercent: "15",
      endsAt: "2026-05-09T11:00:00.000Z",
      note: " Uvolneny termin ",
      serviceId: UUID,
      staffId: "",
      startsAt: "2026-05-09T10:00:00.000Z",
    });

    expect(parsed).toEqual({
      discountPercent: 15,
      endsAt: "2026-05-09T11:00:00.000Z",
      note: "Uvolneny termin",
      serviceId: UUID,
      staffId: undefined,
      startsAt: "2026-05-09T10:00:00.000Z",
    });
  });

  it("odmitne konec pred zacatkem", () => {
    const parsed = recoveryOfferSchema.safeParse({
      discountPercent: "0",
      endsAt: "2026-05-09T10:00:00.000Z",
      serviceId: UUID,
      startsAt: "2026-05-09T11:00:00.000Z",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.path).toEqual(["endsAt"]);
  });

  it("validuje prirazeni klienta k recovery nabidce", () => {
    expect(recoveryRecipientSchema.parse({ clientId: UUID, offerId: UUID })).toEqual({
      clientId: UUID,
      offerId: UUID,
    });
  });
});
