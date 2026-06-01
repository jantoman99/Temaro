"use server";

import { resolveTxt } from "node:dns/promises";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { createCalendarFeedToken, getCalendarFeedUrl, hashCalendarFeedToken } from "@/lib/calendar/ical";
import { createCustomDomainVerificationToken, getCustomDomainTxtName } from "@/lib/custom-domain";
import { hasSupabaseEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { customDomainSchema } from "@/lib/validations/custom-domain";
import { tenantBookingBrandingSchema, tenantSettingsSchema } from "@/lib/validations/settings";

type SettingsActionState = {
  error?: string;
  feedUrl?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function ignoreRevalidateError(action: () => void) {
  try {
    action();
  } catch {
    // Nastaveni uz je ulozene; chyba obnoveni cache nesmi vratit falesny neuspech.
  }
}

const TENANT_ASSETS_BUCKET = "tenant-assets";
const MAX_ASSET_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_ASSET_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);

function getOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function getAssetExtension(file: File) {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/svg+xml") return "svg";

  return null;
}

async function uploadTenantAsset({
  file,
  kind,
  tenantId,
}: {
  file: File | null;
  kind: "cover" | "gallery-1" | "gallery-2" | "gallery-3" | "gallery-4" | "gallery-5" | "gallery-6" | "logo";
  tenantId: string;
}) {
  if (!file) {
    return null;
  }

  if (!ALLOWED_ASSET_TYPES.has(file.type)) {
    return { error: "Podporované jsou jen obrázky JPG, PNG, WebP nebo SVG." };
  }

  if (file.size > MAX_ASSET_SIZE_BYTES) {
    return { error: "Obrázek může mít maximálně 5 MB." };
  }

  const extension = getAssetExtension(file);

  if (!extension) {
    return { error: "Nepodporovaný typ obrázku." };
  }

  const admin = createAdminClient();
  const path = `${tenantId}/${kind}.${extension}`;
  const { error } = await admin.storage.from(TENANT_ASSETS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    return { error: "Obrázek se nepodařilo nahrát." };
  }

  const { data } = admin.storage.from(TENANT_ASSETS_BUCKET).getPublicUrl(path);

  return { publicUrl: data.publicUrl };
}

export async function updateTenantSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: nastavení by se tady uložilo do databáze." };
  }

  const parsed = tenantSettingsSchema.safeParse({
    name: getStringValue(formData, "name"),
    timezone: getStringValue(formData, "timezone"),
    locale: getStringValue(formData, "locale"),
    defaultCurrency: getStringValue(formData, "defaultCurrency"),
    industry: getStringValue(formData, "industry") || "hair",
    cancellationNoticeHours: getStringValue(formData, "cancellationNoticeHours"),
    publicAddress: getStringValue(formData, "publicAddress"),
    publicCity: getStringValue(formData, "publicCity"),
    publicRegion: getStringValue(formData, "publicRegion"),
    publicPostalCode: getStringValue(formData, "publicPostalCode"),
    publicCountryCode: getStringValue(formData, "publicCountryCode") || "CZ",
    publicMapUrl: getStringValue(formData, "publicMapUrl"),
    publicLatitude: getStringValue(formData, "publicLatitude"),
    publicLongitude: getStringValue(formData, "publicLongitude"),
    reviewUrl: getStringValue(formData, "reviewUrl"),
    reviewRating: getStringValue(formData, "reviewRating"),
    reviewCount: getStringValue(formData, "reviewCount") || "0",
    reviewSourceLabel: getStringValue(formData, "reviewSourceLabel"),
    isPubliclyListed: formData.get("isPubliclyListed") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatné nastavení." };
  }

  const { data: updatedTenant, error } = await auth.supabase
    .from("tenants")
    .update({
      name: parsed.data.name,
      timezone: parsed.data.timezone,
      locale: parsed.data.locale,
      default_currency: parsed.data.defaultCurrency,
      industry: parsed.data.industry,
      cancellation_notice_hours: parsed.data.cancellationNoticeHours,
      public_address: parsed.data.publicAddress,
      public_city: parsed.data.publicCity,
      public_region: parsed.data.publicRegion,
      public_postal_code: parsed.data.publicPostalCode,
      public_country_code: parsed.data.publicCountryCode,
      public_map_url: parsed.data.publicMapUrl,
      public_latitude: parsed.data.publicLatitude,
      public_longitude: parsed.data.publicLongitude,
      review_url: parsed.data.reviewUrl,
      review_rating: parsed.data.reviewRating,
      review_count: parsed.data.reviewCount,
      review_source_label: parsed.data.reviewSourceLabel,
      is_publicly_listed: parsed.data.isPubliclyListed,
    })
    .eq("id", auth.tenantId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !updatedTenant) {
    return { error: "Nastavení se nepodařilo uložit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/settings");
  });

  return { success: "Nastavení bylo uloženo." };
}

export async function updateTenantBookingBrandingAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: vzhled booking stránky by se tady uložil do databáze." };
  }

  const parsed = tenantBookingBrandingSchema.safeParse({
    publicDescription: getStringValue(formData, "publicDescription"),
    logoUrl: getStringValue(formData, "logoUrl"),
    coverImageUrl: getStringValue(formData, "coverImageUrl"),
    galleryImageUrls: getStringValue(formData, "galleryImageUrls"),
    amenities: getStringValue(formData, "amenities"),
    socialInstagramUrl: getStringValue(formData, "socialInstagramUrl"),
    socialFacebookUrl: getStringValue(formData, "socialFacebookUrl"),
    socialTiktokUrl: getStringValue(formData, "socialTiktokUrl"),
    socialWebsiteUrl: getStringValue(formData, "socialWebsiteUrl"),
    brandColor: getStringValue(formData, "brandColor") || "#635BFF",
    confirmationMessage: getStringValue(formData, "confirmationMessage"),
    reminderMessage: getStringValue(formData, "reminderMessage"),
    cancellationMessage: getStringValue(formData, "cancellationMessage"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatné nastavení booking stránky." };
  }

  const [uploadedLogo, uploadedCover] = await Promise.all([
    uploadTenantAsset({ file: getOptionalFile(formData, "logoFile"), kind: "logo", tenantId: auth.tenantId }),
    uploadTenantAsset({ file: getOptionalFile(formData, "coverImageFile"), kind: "cover", tenantId: auth.tenantId }),
  ]);
  const galleryFiles = formData
    .getAll("galleryImageFiles")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, 6);
  const uploadedGallery = await Promise.all(
    galleryFiles.map((file, index) =>
      uploadTenantAsset({
        file,
        kind: `gallery-${index + 1}` as "gallery-1" | "gallery-2" | "gallery-3" | "gallery-4" | "gallery-5" | "gallery-6",
        tenantId: auth.tenantId,
      }),
    ),
  );

  if (uploadedLogo?.error) {
    return { error: uploadedLogo.error };
  }

  if (uploadedCover?.error) {
    return { error: uploadedCover.error };
  }

  const galleryUploadError = uploadedGallery.find((upload) => upload?.error)?.error;

  if (galleryUploadError) {
    return { error: galleryUploadError };
  }

  const galleryImageUrls = [
    ...parsed.data.galleryImageUrls,
    ...uploadedGallery.flatMap((upload) => (upload?.publicUrl ? [upload.publicUrl] : [])),
  ].slice(0, 6);

  const { data: updatedTenant, error } = await auth.supabase
    .from("tenants")
    .update({
      public_description: parsed.data.publicDescription,
      logo_url: uploadedLogo?.publicUrl ?? parsed.data.logoUrl,
      cover_image_url: uploadedCover?.publicUrl ?? parsed.data.coverImageUrl,
      public_gallery_image_urls: galleryImageUrls,
      public_amenities: parsed.data.amenities,
      social_instagram_url: parsed.data.socialInstagramUrl,
      social_facebook_url: parsed.data.socialFacebookUrl,
      social_tiktok_url: parsed.data.socialTiktokUrl,
      social_website_url: parsed.data.socialWebsiteUrl,
      brand_color: parsed.data.brandColor,
      confirmation_message: parsed.data.confirmationMessage,
      reminder_message: parsed.data.reminderMessage,
      cancellation_message: parsed.data.cancellationMessage,
    })
    .eq("id", auth.tenantId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !updatedTenant) {
    return { error: "Booking stránku se nepodařilo uložit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/booking-page");
    revalidatePath("/settings");
  });

  return { success: "Booking stránka byla uložena." };
}

export async function createCalendarFeedAction(
  _previousState: SettingsActionState,
  _formData: FormData,
): Promise<SettingsActionState> {
  void _previousState;
  void _formData;

  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: iCal feed by se tady vygeneroval." };
  }

  const token = createCalendarFeedToken();
  const { error } = await auth.supabase.from("calendar_feed_tokens").insert({
    tenant_id: auth.tenantId,
    staff_id: null,
    token_hash: hashCalendarFeedToken(token),
    name: "Hlavní iCal feed",
    created_by: auth.user.id,
  });

  if (error) {
    return { error: "iCal feed se nepodařilo vytvořit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/settings");
  });

  return {
    feedUrl: getCalendarFeedUrl(token),
    success: "iCal feed byl vytvořen. Odkaz si uložte, později už z bezpečnostních důvodů nepůjde znovu zobrazit.",
  };
}

export async function revokeCalendarFeedAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: iCal feed by se tady zrušil." };
  }

  const feedId = getStringValue(formData, "feedId");

  if (!feedId || !/^[0-9a-f-]{36}$/.test(feedId)) {
    return { error: "Neplatný iCal feed." };
  }

  const { data: updatedFeed, error } = await auth.supabase
    .from("calendar_feed_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("tenant_id", auth.tenantId)
    .eq("id", feedId)
    .is("revoked_at", null)
    .select("id")
    .maybeSingle();

  if (error || !updatedFeed) {
    return { error: "iCal feed se nepodařilo zrušit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/settings");
  });

  return { success: "iCal feed byl zrušen." };
}

export async function updateCustomDomainAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = customDomainSchema.safeParse({
    customDomain: getStringValue(formData, "customDomain"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatná doména." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: vlastní doména by se tady uložila." };
  }

  const customDomain = parsed.data.customDomain || null;
  const verificationToken = customDomain ? createCustomDomainVerificationToken() : null;
  const { error } = await auth.supabase
    .from("tenants")
    .update({
      custom_domain: customDomain,
      custom_domain_status: customDomain ? "pending" : "none",
      custom_domain_verification_token: verificationToken,
      custom_domain_verified_at: null,
    })
    .eq("id", auth.tenantId)
    .is("deleted_at", null);

  if (error) {
    return { error: "Doménu se nepodařilo uložit. Možná ji už používá jiný podnik." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/settings");
  });

  return {
    success: customDomain
      ? "Doména byla uložena. Přidejte TXT záznam a spusťte ověření."
      : "Vlastní doména byla odebrána.",
  };
}

export async function verifyCustomDomainAction(
  _previousState: SettingsActionState,
  _formData: FormData,
): Promise<SettingsActionState> {
  void _previousState;
  void _formData;

  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: DNS ověření by se tady spustilo." };
  }

  const { data: tenant, error: tenantError } = await auth.supabase
    .from("tenants")
    .select("custom_domain, custom_domain_verification_token")
    .eq("id", auth.tenantId)
    .is("deleted_at", null)
    .maybeSingle();

  if (tenantError || !tenant?.custom_domain || !tenant.custom_domain_verification_token) {
    return { error: "Nejdřív uložte vlastní doménu." };
  }

  let txtRecords: string[][] = [];

  try {
    txtRecords = await resolveTxt(getCustomDomainTxtName(tenant.custom_domain));
  } catch {
    return { error: "TXT záznam zatím nebyl nalezen. DNS změny se mohou propsat až za několik minut." };
  }

  const hasToken = txtRecords.some((record) => record.join("").trim() === tenant.custom_domain_verification_token);

  if (!hasToken) {
    return { error: "TXT záznam neobsahuje správný ověřovací token." };
  }

  const { error } = await auth.supabase
    .from("tenants")
    .update({
      custom_domain_status: "active",
      custom_domain_verified_at: new Date().toISOString(),
    })
    .eq("id", auth.tenantId)
    .eq("custom_domain", tenant.custom_domain)
    .is("deleted_at", null);

  if (error) {
    return { error: "Doménu se nepodařilo označit jako ověřenou." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/settings");
  });

  return { success: "Doména byla ověřena a může zobrazovat booking stránku." };
}
