import { describe, expect, it } from "vitest";

import { getServiceTemplate, getServiceTemplatesForIndustry } from "@/lib/service-templates";

describe("service templates", () => {
  it("vraci hair sablony jako vychozi nejblizsi segment", () => {
    const templates = getServiceTemplatesForIndustry("hair");

    expect(templates.map((template) => template.name)).toContain("Střih");
    expect(templates.map((template) => template.name)).toContain("Střih + vousy");
  });

  it("ma rychle sablony pro soukroma fitka bez skupinovych kapacit", () => {
    const templates = getServiceTemplatesForIndustry("private_fitness");

    expect(templates.map((template) => template.name)).toEqual([
      "Osobní trénink",
      "Vstupní konzultace",
      "Pronájem tréninkové zóny",
    ]);
  });

  it("fallbackuje nepokryte obory na hair sablony", () => {
    const templates = getServiceTemplatesForIndustry("physio");

    expect(templates[0]?.id).toBe("hair-cut");
  });

  it("najde sablonu jen v aktualnim oboru", () => {
    expect(getServiceTemplate("fitness-personal-training", "private_fitness")?.name).toBe("Osobní trénink");
    expect(getServiceTemplate("fitness-personal-training", "hair")).toBeNull();
  });
});
