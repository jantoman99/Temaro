import type { Database } from "@/types/database";

type TenantLocationBase = Pick<
  Database["public"]["Tables"]["tenants"]["Row"],
  | "public_address"
  | "public_city"
  | "public_country_code"
  | "public_map_url"
  | "public_postal_code"
  | "public_region"
>;

type TenantCoordinates = Pick<Database["public"]["Tables"]["tenants"]["Row"], "public_latitude" | "public_longitude">;

type TenantLocation = TenantLocationBase & Partial<TenantCoordinates>;

export function formatTenantAddress(tenant: TenantLocation) {
  const cityLine = [tenant.public_postal_code, tenant.public_city].filter(Boolean).join(" ");
  const addressParts = [tenant.public_address, cityLine, tenant.public_region].filter(Boolean);

  if (addressParts.length === 0) {
    return null;
  }

  return [...addressParts, tenant.public_country_code].filter(Boolean).join(", ");
}

export function getTenantMapHref(tenant: TenantLocation) {
  if (tenant.public_map_url) {
    return tenant.public_map_url;
  }

  const address = formatTenantAddress(tenant);

  if (!address) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function getTenantMapEmbedUrl(tenant: TenantLocation) {
  if (hasTenantCoordinates(tenant)) {
    const latitudeDelta = 0.004;
    const longitudeDelta = 0.006;
    const bbox = [
      tenant.public_longitude - longitudeDelta,
      tenant.public_latitude - latitudeDelta,
      tenant.public_longitude + longitudeDelta,
      tenant.public_latitude + latitudeDelta,
    ].join(",");

    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(
      `${tenant.public_latitude},${tenant.public_longitude}`,
    )}`;
  }

  return null;
}

export function getDistanceKm(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) {
  const earthRadiusKm = 6371;
  const fromLatitude = (from.latitude * Math.PI) / 180;
  const toLatitude = (to.latitude * Math.PI) / 180;
  const latitudeDelta = ((to.latitude - from.latitude) * Math.PI) / 180;
  const longitudeDelta = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function hasTenantCoordinates(
  tenant: Pick<TenantLocation, "public_latitude" | "public_longitude">,
): tenant is { public_latitude: number; public_longitude: number } {
  return typeof tenant.public_latitude === "number" && typeof tenant.public_longitude === "number";
}
