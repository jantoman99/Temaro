import { getBaseAppUrl } from "@/lib/app-url";
import { getTenantIndustryLabel } from "@/lib/tenant-industry";
import { formatTenantAddress } from "@/lib/tenant-location";
import type { Database } from "@/types/database";

type TenantForSchema = Pick<
  Database["public"]["Tables"]["tenants"]["Row"],
  | "brand_color"
  | "cover_image_url"
  | "industry"
  | "logo_url"
  | "name"
  | "public_address"
  | "public_city"
  | "public_country_code"
  | "public_description"
  | "public_map_url"
  | "public_postal_code"
  | "public_region"
  | "slug"
>;

type ServiceForSchema = Pick<
  Database["public"]["Tables"]["services"]["Row"],
  "currency" | "description" | "duration_minutes" | "name" | "price"
>;

function toAbsoluteUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, getBaseAppUrl()).toString();
  } catch {
    return null;
  }
}

function buildPostalAddress(tenant: TenantForSchema) {
  if (!formatTenantAddress(tenant)) {
    return null;
  }

  return {
    "@type": "PostalAddress",
    addressCountry: tenant.public_country_code,
    addressLocality: tenant.public_city ?? undefined,
    addressRegion: tenant.public_region ?? undefined,
    postalCode: tenant.public_postal_code ?? undefined,
    streetAddress: tenant.public_address ?? undefined,
  };
}

export function buildTenantLocalBusinessJsonLd({
  services,
  tenant,
}: {
  services: ServiceForSchema[];
  tenant: TenantForSchema;
}) {
  const baseUrl = getBaseAppUrl();
  const bookingUrl = `${baseUrl}/${tenant.slug}`;
  const businessId = `${bookingUrl}#business`;
  const address = buildPostalAddress(tenant);
  const image = toAbsoluteUrl(tenant.cover_image_url) ?? toAbsoluteUrl(tenant.logo_url);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": businessId,
        "@type": "LocalBusiness",
        address: address ?? undefined,
        description: tenant.public_description ?? undefined,
        image: image ?? undefined,
        logo: toAbsoluteUrl(tenant.logo_url) ?? undefined,
        name: tenant.name,
        priceRange: services.some((service) => service.price > 0) ? "$$" : undefined,
        serviceType: getTenantIndustryLabel(tenant.industry),
        url: bookingUrl,
      },
      ...services.slice(0, 12).map((service, index) => ({
        "@id": `${bookingUrl}#service-${index + 1}`,
        "@type": "Service",
        description: service.description ?? undefined,
        name: service.name,
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          price: (service.price / 100).toFixed(2),
          priceCurrency: service.currency,
          url: bookingUrl,
        },
        provider: {
          "@id": businessId,
        },
        serviceType: service.name,
        timeRequired: `PT${service.duration_minutes}M`,
      })),
    ],
  };
}
