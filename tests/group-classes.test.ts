import { describe, expect, it } from "vitest";

import { groupClassEnrollmentSchema, groupClassSchema } from "@/lib/validations/group-classes";

const UUID_1 = "11111111-1111-4111-8111-111111111111";
const UUID_2 = "22222222-2222-4222-8222-222222222222";

describe("group class validations", () => {
  it("normalizuje skupinovou lekci", () => {
    const parsed = groupClassSchema.parse({
      capacity: "12",
      currency: "CZK",
      endsAt: "2026-05-09T11:00:00.000Z",
      locationId: "",
      note: "  Kurz pro začátečníky ",
      price: "350,50",
      resourceId: "",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-05-09T10:00:00.000Z",
      title: " Ranní lekce ",
    });

    expect(parsed).toEqual({
      capacity: 12,
      currency: "CZK",
      endsAt: "2026-05-09T11:00:00.000Z",
      locationId: undefined,
      note: "Kurz pro začátečníky",
      price: 35050,
      resourceId: undefined,
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-05-09T10:00:00.000Z",
      title: "Ranní lekce",
    });
  });

  it("odmitne konec pred zacatkem", () => {
    const parsed = groupClassSchema.safeParse({
      capacity: "8",
      currency: "CZK",
      endsAt: "2026-05-09T09:00:00.000Z",
      serviceId: UUID_1,
      startsAt: "2026-05-09T10:00:00.000Z",
      title: "Lekce",
    });

    expect(parsed.success).toBe(false);
  });

  it("validuje prihlaseni klienta na lekci", () => {
    expect(groupClassEnrollmentSchema.parse({ clientId: UUID_1, groupClassId: UUID_2, note: "" })).toEqual({
      clientId: UUID_1,
      groupClassId: UUID_2,
      note: undefined,
    });
  });
});
