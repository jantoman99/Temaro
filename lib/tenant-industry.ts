export const TENANT_INDUSTRIES = [
  { value: "hair", label: "Hair: barber + kadeřnictví" },
  { value: "beauty", label: "Kosmetika / beauty" },
  { value: "nails", label: "Nehty / pedikúra / řasy / obočí" },
  { value: "massage_wellness", label: "Masáže / wellness" },
  { value: "private_fitness", label: "Soukromá fitka / osobní trenéři" },
  { value: "physio", label: "Fyzio" },
  { value: "pet_grooming", label: "Psí salon / grooming" },
  { value: "other", label: "Jiné služby" },
] as const;

export type TenantIndustry = (typeof TENANT_INDUSTRIES)[number]["value"];

const tenantIndustryLabels = new Map<string, string>(
  TENANT_INDUSTRIES.map((industry) => [industry.value, industry.label]),
);

export function isTenantIndustry(value: string): value is TenantIndustry {
  return tenantIndustryLabels.has(value);
}

export function getTenantIndustryLabel(industry: string | null | undefined) {
  if (!industry) {
    return tenantIndustryLabels.get("other") ?? "Jiné služby";
  }

  return tenantIndustryLabels.get(industry) ?? tenantIndustryLabels.get("other") ?? "Jiné služby";
}
