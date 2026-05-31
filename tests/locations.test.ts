import { describe, expect, it } from "vitest";

import { tenantLocationSchema } from "@/lib/validations/locations";

describe("location validations", () => {
  it("normalizuje pobocku", () => {
    const parsed = tenantLocationSchema.parse({
      address: " Kobližná 12 ",
      city: " Brno ",
      countryCode: "cz",
      email: "",
      isPrimary: true,
      latitude: "49,1951",
      longitude: "16.6068",
      name: " Brno centrum ",
      phone: "+420777123456",
      postalCode: "602 00",
      region: "JMK",
    });

    expect(parsed.countryCode).toBe("CZ");
    expect(parsed.latitude).toBe(49.1951);
    expect(parsed.longitude).toBe(16.6068);
    expect(parsed.email).toBeUndefined();
  });

  it("odmitne nekompletni souradnice", () => {
    const parsed = tenantLocationSchema.safeParse({
      countryCode: "CZ",
      latitude: "49.1951",
      longitude: "",
      name: "Pobočka",
    });

    expect(parsed.success).toBe(false);
  });
});
