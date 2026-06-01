import type { TenantIndustry } from "@/lib/tenant-industry";

export type ServiceTemplate = {
  bufferMinutes: number;
  description: string;
  durationMinutes: number;
  id: string;
  name: string;
  price: string;
};

const templatesByIndustry: Partial<Record<TenantIndustry, ServiceTemplate[]>> = {
  beauty: [
    {
      bufferMinutes: 10,
      description: "Základní kosmetické ošetření pleti včetně konzultace.",
      durationMinutes: 60,
      id: "beauty-facial-basic",
      name: "Kosmetické ošetření",
      price: "900",
    },
    {
      bufferMinutes: 10,
      description: "Hloubkové čištění pleti s doporučením domácí péče.",
      durationMinutes: 75,
      id: "beauty-deep-cleaning",
      name: "Hloubkové čištění pleti",
      price: "1200",
    },
    {
      bufferMinutes: 5,
      description: "Úprava a barvení obočí podle tvaru obličeje.",
      durationMinutes: 30,
      id: "beauty-brows",
      name: "Úprava obočí",
      price: "350",
    },
  ],
  hair: [
    {
      bufferMinutes: 0,
      description: "Klasický střih, mytí a styling pro běžnou návštěvu.",
      durationMinutes: 45,
      id: "hair-cut",
      name: "Střih",
      price: "600",
    },
    {
      bufferMinutes: 0,
      description: "Úprava vousů, kontury a závěrečný styling.",
      durationMinutes: 30,
      id: "hair-beard",
      name: "Úprava vousů",
      price: "350",
    },
    {
      bufferMinutes: 0,
      description: "Kombinace střihu a úpravy vousů v jednom termínu.",
      durationMinutes: 60,
      id: "hair-cut-beard",
      name: "Střih + vousy",
      price: "850",
    },
    {
      bufferMinutes: 0,
      description: "Rychlejší střih pro děti bez složitého stylingu.",
      durationMinutes: 30,
      id: "hair-kids",
      name: "Dětský střih",
      price: "450",
    },
  ],
  massage_wellness: [
    {
      bufferMinutes: 15,
      description: "Klasická masáž zad a šíje pro uvolnění napětí.",
      durationMinutes: 60,
      id: "massage-back-neck",
      name: "Masáž zad a šíje",
      price: "900",
    },
    {
      bufferMinutes: 15,
      description: "Delší celotělová masáž pro regeneraci.",
      durationMinutes: 90,
      id: "massage-full-body",
      name: "Celotělová masáž",
      price: "1300",
    },
    {
      bufferMinutes: 10,
      description: "Kratší relaxační masáž pro rychlé uvolnění.",
      durationMinutes: 45,
      id: "massage-relax",
      name: "Relaxační masáž",
      price: "700",
    },
  ],
  nails: [
    {
      bufferMinutes: 10,
      description: "Modeláž nebo doplnění nehtů podle aktuálního stavu.",
      durationMinutes: 90,
      id: "nails-gel",
      name: "Gelové nehty",
      price: "850",
    },
    {
      bufferMinutes: 10,
      description: "Suchá nebo mokrá pedikúra včetně základní péče.",
      durationMinutes: 60,
      id: "nails-pedicure",
      name: "Pedikúra",
      price: "650",
    },
    {
      bufferMinutes: 5,
      description: "Doplnění řas nebo základní úprava podle potřeby klientky.",
      durationMinutes: 75,
      id: "nails-lashes",
      name: "Doplnění řas",
      price: "900",
    },
  ],
  private_fitness: [
    {
      bufferMinutes: 10,
      description: "Individuální trénink s trenérem pro jednoho klienta.",
      durationMinutes: 60,
      id: "fitness-personal-training",
      name: "Osobní trénink",
      price: "900",
    },
    {
      bufferMinutes: 10,
      description: "První konzultace, cíle klienta a základní plán.",
      durationMinutes: 45,
      id: "fitness-consultation",
      name: "Vstupní konzultace",
      price: "500",
    },
    {
      bufferMinutes: 15,
      description: "Samostatný pronájem soukromé tréninkové zóny.",
      durationMinutes: 60,
      id: "fitness-zone-rental",
      name: "Pronájem tréninkové zóny",
      price: "600",
    },
  ],
};

export function getServiceTemplatesForIndustry(industry: TenantIndustry): ServiceTemplate[] {
  return templatesByIndustry[industry] ?? templatesByIndustry.hair ?? [];
}

export function getServiceTemplate(templateId: string, industry: TenantIndustry) {
  return getServiceTemplatesForIndustry(industry).find((template) => template.id === templateId) ?? null;
}

export function getStarterServiceTemplates(industry: TenantIndustry) {
  return getServiceTemplatesForIndustry(industry).slice(0, 3);
}
