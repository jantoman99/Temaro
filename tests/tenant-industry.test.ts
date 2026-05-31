import { describe, expect, it } from "vitest";

import { getTenantIndustryLabel, isTenantIndustry, TENANT_INDUSTRIES } from "@/lib/tenant-industry";

describe("tenant industry", () => {
  it("drzi povolene obory jako stabilni enum pro katalog", () => {
    expect(TENANT_INDUSTRIES.map((industry) => industry.value)).toEqual([
      "hair",
      "beauty",
      "nails",
      "massage_wellness",
      "private_fitness",
      "physio",
      "pet_grooming",
      "other",
    ]);
  });

  it("rozpozna validni obor a odmitne volny text", () => {
    expect(isTenantIndustry("hair")).toBe(true);
    expect(isTenantIndustry("autoservis")).toBe(false);
  });

  it("vraci citelny fallback pro neznamy obor", () => {
    expect(getTenantIndustryLabel("hair")).toBe("Hair: barber + kadeřnictví");
    expect(getTenantIndustryLabel("unknown")).toBe("Jiné služby");
    expect(getTenantIndustryLabel(null)).toBe("Jiné služby");
  });
});
