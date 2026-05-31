import { describe, expect, it } from "vitest";

import { formatTenantAddress, getDistanceKm, getTenantMapHref, hasTenantCoordinates } from "@/lib/tenant-location";

const baseTenant = {
  public_address: null,
  public_city: null,
  public_country_code: "CZ",
  public_latitude: null,
  public_longitude: null,
  public_map_url: null,
  public_postal_code: null,
  public_region: null,
};

describe("tenant location helpers", () => {
  it("sestavi verejnou adresu bez prazdnych casti", () => {
    expect(
      formatTenantAddress({
        ...baseTenant,
        public_address: "Kobližná 12",
        public_city: "Brno",
        public_postal_code: "602 00",
      }),
    ).toBe("Kobližná 12, 602 00 Brno, CZ");
  });

  it("pouzije vlastni mapovy odkaz, pokud je vyplneny", () => {
    expect(getTenantMapHref({ ...baseTenant, public_map_url: "https://maps.example.com/studio" })).toBe(
      "https://maps.example.com/studio",
    );
  });

  it("vytvori bezpecny google maps search odkaz z verejne adresy", () => {
    const href = getTenantMapHref({
      ...baseTenant,
      public_address: "Kobližná 12",
      public_city: "Brno",
      public_postal_code: "602 00",
    });

    expect(href).toBe("https://www.google.com/maps/search/?api=1&query=Kobli%C5%BEn%C3%A1%2012%2C%20602%2000%20Brno%2C%20CZ");
  });

  it("nevrati mapovy odkaz bez adresy", () => {
    expect(getTenantMapHref(baseTenant)).toBeNull();
  });

  it("spocita vzdalenost mezi souradnicemi", () => {
    const distance = getDistanceKm(
      { latitude: 49.1951, longitude: 16.6068 },
      { latitude: 50.0755, longitude: 14.4378 },
    );

    expect(Math.round(distance)).toBe(184);
  });

  it("pozna kompletni verejne souradnice", () => {
    expect(hasTenantCoordinates(baseTenant)).toBe(false);
    expect(hasTenantCoordinates({ ...baseTenant, public_latitude: 49.1951, public_longitude: 16.6068 })).toBe(true);
  });
});
