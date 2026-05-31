import { describe, expect, it, vi } from "vitest";

import { demoServices, demoTenant } from "@/lib/demo/data";
import { buildTenantLocalBusinessJsonLd } from "@/lib/seo/local-business-schema";

vi.mock("@/lib/app-url", () => ({
  getBaseAppUrl: () => "https://temaro.test",
}));

describe("local business schema", () => {
  it("sestavi LocalBusiness s adresou, oborem a booking URL", () => {
    const jsonLd = buildTenantLocalBusinessJsonLd({
      services: demoServices.slice(0, 2),
      tenant: demoTenant,
    });

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@graph"][0]).toMatchObject({
      "@type": "LocalBusiness",
      address: {
        "@type": "PostalAddress",
        addressCountry: "CZ",
        addressLocality: "Brno",
      },
      name: "Temaro Demo Studio",
      serviceType: "Hair: barber + kadeřnictví",
      url: "https://temaro.test/demo-barber",
    });
  });

  it("prida Service polozky s cenou v mene sluzby", () => {
    const jsonLd = buildTenantLocalBusinessJsonLd({
      services: demoServices.slice(0, 1),
      tenant: demoTenant,
    });

    expect(jsonLd["@graph"][1]).toMatchObject({
      "@type": "Service",
      name: demoServices[0]?.name,
      offers: {
        "@type": "Offer",
        price: (demoServices[0]!.price / 100).toFixed(2),
        priceCurrency: "CZK",
      },
      provider: {
        "@id": "https://temaro.test/demo-barber#business",
      },
    });
  });

  it("omezi pocet Service polozek kvuli velikosti JSON-LD", () => {
    const services = Array.from({ length: 20 }, (_, index) => ({
      ...demoServices[0]!,
      name: `Služba ${index + 1}`,
    }));
    const jsonLd = buildTenantLocalBusinessJsonLd({ services, tenant: demoTenant });

    expect(jsonLd["@graph"]).toHaveLength(13);
  });
});
