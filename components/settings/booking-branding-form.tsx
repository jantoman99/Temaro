"use client";

import { useActionState, useEffect, useState } from "react";
import type { ChangeEvent, CSSProperties, Dispatch, SetStateAction } from "react";

import { updateTenantBookingBrandingAction } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type Tenant = Pick<
  Database["public"]["Tables"]["tenants"]["Row"],
  | "brand_color"
  | "cancellation_message"
  | "confirmation_message"
  | "cover_image_url"
  | "logo_url"
  | "public_amenities"
  | "public_description"
  | "public_gallery_image_urls"
  | "reminder_message"
  | "social_facebook_url"
  | "social_instagram_url"
  | "social_tiktok_url"
  | "social_website_url"
>;

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";
const textareaClassName =
  "rounded-md border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

type SelectedImage = {
  name: string;
  url: string;
};

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function handleImageSelection(setter: Dispatch<SetStateAction<SelectedImage | null>>) {
  return (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setter(null);
      return;
    }

    setter((previous) => {
      if (previous?.url.startsWith("blob:")) {
        URL.revokeObjectURL(previous.url);
      }

      return {
        name: file.name,
        url: URL.createObjectURL(file),
      };
    });
  };
}

function VisualUploadField({
  accept,
  currentUrl,
  description,
  inputId,
  label,
  name,
  previewClassName,
  selectedImage,
  onChange,
}: {
  accept: string;
  currentUrl: string;
  description: string;
  inputId: string;
  label: string;
  name: string;
  previewClassName: string;
  selectedImage: SelectedImage | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const previewUrl = selectedImage?.url ?? currentUrl;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold" htmlFor={inputId}>
        {label}
      </label>
      <label
        className={`group relative grid cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-secondary text-center transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5 ${previewClassName}`}
        htmlFor={inputId}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="absolute inset-0 h-full w-full object-cover" src={previewUrl} />
        ) : null}
        <span className="absolute inset-0 bg-gradient-to-t from-background/82 via-background/28 to-transparent opacity-90" />
        <span className="relative mx-4 rounded-full border border-border bg-card/92 px-4 py-2 text-sm font-bold text-foreground shadow-sm transition group-hover:border-primary/40">
          {previewUrl ? "Vyměnit obrázek" : description}
        </span>
      </label>
      <input id={inputId} name={name} type="file" accept={accept} className="sr-only" onChange={onChange} />
      <p className="text-xs font-semibold text-muted-foreground">
        {selectedImage ? selectedImage.name : "JPG, PNG, WebP nebo SVG do 5 MB."}
      </p>
    </div>
  );
}

export function BookingBrandingForm({ tenant }: { tenant: Tenant }) {
  const [state, formAction, isPending] = useActionState(updateTenantBookingBrandingAction, initialState);
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(tenant.cover_image_url ?? "");
  const [brandColor, setBrandColor] = useState(tenant.brand_color ?? "#635BFF");
  const [publicDescription, setPublicDescription] = useState(tenant.public_description ?? "");
  const [galleryUrls, setGalleryUrls] = useState((tenant.public_gallery_image_urls ?? []).join("\n"));
  const [amenities, setAmenities] = useState((tenant.public_amenities ?? []).join("\n"));
  const [selectedLogo, setSelectedLogo] = useState<SelectedImage | null>(null);
  const [selectedCover, setSelectedCover] = useState<SelectedImage | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<SelectedImage[]>([]);
  const previewLogoUrl = selectedLogo?.url ?? logoUrl;
  const previewCoverUrl = selectedCover?.url ?? coverImageUrl;
  const previewGalleryUrls = [
    ...selectedGallery.map((image) => image.url),
    ...galleryUrls
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean),
  ].slice(0, 6);
  const previewAmenities = amenities
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
  const customerDescription = publicDescription.trim() || "Popište klientům, kde vás najdou, jak rezervace probíhá a co mají vědět před návštěvou.";

  useEffect(() => {
    return () => {
      if (selectedLogo?.url.startsWith("blob:")) {
        URL.revokeObjectURL(selectedLogo.url);
      }
    };
  }, [selectedLogo]);

  useEffect(() => {
    return () => {
      if (selectedCover?.url.startsWith("blob:")) {
        URL.revokeObjectURL(selectedCover.url);
      }
    };
  }, [selectedCover]);

  useEffect(() => {
    return () => {
      selectedGallery.forEach((image) => {
        if (image.url.startsWith("blob:")) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [selectedGallery]);

  return (
    <form action={formAction} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Branding</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Co uvidí zákazník</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          Klikněte na úvodní fotku nebo logo, nahrajte obrázek a hned uvidíte, jak stránka působí.
        </p>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-4">
          <VisualUploadField
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            currentUrl={coverImageUrl}
            description="Nahrát úvodní fotku"
            inputId="coverImageFile"
            label="Úvodní fotka stránky"
            name="coverImageFile"
            previewClassName="min-h-56"
            selectedImage={selectedCover}
            onChange={handleImageSelection(setSelectedCover)}
          />
          <div className="grid gap-4 md:grid-cols-[minmax(0,0.72fr)_minmax(180px,0.28fr)]">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="publicDescription">
                Krátký veřejný popis
              </label>
              <textarea
                id="publicDescription"
                name="publicDescription"
                maxLength={280}
                rows={4}
                value={publicDescription}
                placeholder="Např. Moderní barber studio v centru Brna. Vyberte službu a termín bez telefonování."
                className={textareaClassName}
                onChange={(event) => setPublicDescription(event.target.value)}
              />
            </div>
            <VisualUploadField
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              currentUrl={logoUrl}
              description="Nahrát logo"
              inputId="logoFile"
              label="Logo"
              name="logoFile"
              previewClassName="min-h-36"
              selectedImage={selectedLogo}
              onChange={handleImageSelection(setSelectedLogo)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="brandColor">
                Barva podniku
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-2">
                <input
                  id="brandColor"
                  name="brandColor"
                  type="color"
                  value={brandColor}
                  className="h-11 w-14 rounded-md border border-input bg-background px-1 py-1"
                  onChange={(event) => setBrandColor(event.target.value)}
                />
                <span className="text-sm font-bold text-muted-foreground">{brandColor.toUpperCase()}</span>
              </div>
            </div>
            <details className="rounded-xl border border-border bg-secondary p-4">
              <summary className="cursor-pointer text-sm font-bold text-foreground">Vložit obrázky přes odkaz</summary>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold" htmlFor="logoUrl">
                    Odkaz na logo
                  </label>
                  <input
                    id="logoUrl"
                    name="logoUrl"
                    type="url"
                    maxLength={500}
                    value={logoUrl}
                    placeholder="https://..."
                    className={inputClassName}
                    onChange={(event) => setLogoUrl(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold" htmlFor="coverImageUrl">
                    Odkaz na úvodní fotku
                  </label>
                  <input
                    id="coverImageUrl"
                    name="coverImageUrl"
                    type="url"
                    maxLength={500}
                    value={coverImageUrl}
                    placeholder="https://..."
                    className={inputClassName}
                    onChange={(event) => setCoverImageUrl(event.target.value)}
                  />
                </div>
              </div>
            </details>
          </div>
          <div className="rounded-2xl border border-border bg-secondary p-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-foreground">Fotky práce a prostoru</p>
              <p className="text-sm font-medium leading-6 text-muted-foreground">
                Nahrajte až 6 fotek. Veřejná stránka z nich udělá galerii podobně jako profil salonu.
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
              <label
                className="grid min-h-32 cursor-pointer place-items-center rounded-2xl border border-dashed border-border bg-card px-4 text-center text-sm font-bold text-foreground transition hover:border-primary/60 hover:bg-primary/5"
                htmlFor="galleryImageFiles"
              >
                Přidat fotky
              </label>
              <input
                id="galleryImageFiles"
                name="galleryImageFiles"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                multiple
                className="sr-only"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []).slice(0, 6);

                  setSelectedGallery((previous) => {
                    previous.forEach((image) => {
                      if (image.url.startsWith("blob:")) {
                        URL.revokeObjectURL(image.url);
                      }
                    });

                    return files.map((file) => ({
                      name: file.name,
                      url: URL.createObjectURL(file),
                    }));
                  });
                }}
              />
              <div className="grid grid-cols-3 gap-2">
                {previewGalleryUrls.length > 0 ? (
                  previewGalleryUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative min-h-24 overflow-hidden rounded-xl border border-border bg-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" className="absolute inset-0 h-full w-full object-cover" src={url} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 rounded-xl border border-border bg-card p-4 text-sm font-semibold text-muted-foreground">
                    Fotky se zobrazí tady hned po výběru.
                  </div>
                )}
              </div>
            </div>
            <details className="mt-4 rounded-xl border border-border bg-card p-4">
              <summary className="cursor-pointer text-sm font-bold text-foreground">Upravit odkazy fotek ručně</summary>
              <textarea
                name="galleryImageUrls"
                rows={4}
                value={galleryUrls}
                className={`${textareaClassName} mt-3 w-full`}
                placeholder="Každý odkaz na samostatný řádek"
                onChange={(event) => setGalleryUrls(event.target.value)}
              />
            </details>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-secondary p-4">
              <label className="text-sm font-bold text-foreground" htmlFor="amenities">
                Co u vás klient dostane navíc
              </label>
              <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">
                Jedna položka na řádek, např. káva zdarma, Wi-Fi, pet-friendly nebo platba kartou.
              </p>
              <textarea
                id="amenities"
                name="amenities"
                rows={5}
                value={amenities}
                className={`${textareaClassName} mt-3 w-full`}
                placeholder={"Káva zdarma\nWi-Fi\nPlatba kartou"}
                onChange={(event) => setAmenities(event.target.value)}
              />
            </div>
            <div className="rounded-2xl border border-border bg-secondary p-4">
              <p className="text-sm font-bold text-foreground">Sociální sítě a web</p>
              <div className="mt-3 grid gap-3">
                <input name="socialInstagramUrl" type="url" maxLength={500} defaultValue={tenant.social_instagram_url ?? ""} className={inputClassName} placeholder="Instagram URL" />
                <input name="socialFacebookUrl" type="url" maxLength={500} defaultValue={tenant.social_facebook_url ?? ""} className={inputClassName} placeholder="Facebook URL" />
                <input name="socialTiktokUrl" type="url" maxLength={500} defaultValue={tenant.social_tiktok_url ?? ""} className={inputClassName} placeholder="TikTok URL" />
                <input name="socialWebsiteUrl" type="url" maxLength={500} defaultValue={tenant.social_website_url ?? ""} className={inputClassName} placeholder="Web URL" />
              </div>
            </div>
          </div>
        </div>
        <aside className="rounded-2xl border border-border bg-background p-3 shadow-sm">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative min-h-48 overflow-hidden bg-sidebar text-white" style={{ "--tenant-brand": brandColor } as CSSProperties}>
              {previewCoverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" src={previewCoverUrl} />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,20,0.22),rgba(7,12,20,0.86)),radial-gradient(circle_at_18%_18%,var(--tenant-brand),transparent_34%)]" />
              <div className="relative flex min-h-48 flex-col justify-between p-4">
                <div className="flex items-center justify-between gap-3">
                  {previewLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="Logo podniku" className="size-12 rounded-2xl border border-white/20 bg-white object-cover p-1" src={previewLogoUrl} />
                  ) : (
                    <div className="grid size-12 place-items-center rounded-2xl text-sm font-black text-white shadow-md" style={{ backgroundColor: brandColor }}>
                      {getInitials("Podnik")}
                    </div>
                  )}
                  <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-bold text-white">Online rezervace</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Náhled pro klienta</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">Rezervace bez telefonování</h3>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold leading-6 text-muted-foreground">{customerDescription}</p>
              <div className="mt-4 grid gap-2">
                {["Vybrat službu", "Vybrat termín", "Potvrdit kontakt"].map((label, index) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border border-border bg-muted/35 px-3 py-2">
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                    <span className="grid size-7 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: brandColor }}>
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
              {previewGalleryUrls.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {previewGalleryUrls.slice(0, 3).map((url, index) => (
                    <div key={`${url}-${index}`} className="relative min-h-16 overflow-hidden rounded-lg border border-border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" className="absolute inset-0 h-full w-full object-cover" src={url} />
                    </div>
                  ))}
                </div>
              ) : null}
              {previewAmenities.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {previewAmenities.slice(0, 4).map((item) => (
                    <span key={item} className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold text-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <p className="mt-3 px-1 text-xs font-semibold leading-5 text-muted-foreground">
            Náhled se mění hned při výběru obrázku. Uložený bude až po kliknutí na tlačítko dole.
          </p>
        </aside>
        <div className="rounded-xl border border-border bg-secondary p-4 xl:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Vlastní texty e-mailů</p>
          <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">
            Krátký podpis nebo instrukce. Temaro k němu vždy přidá termín, službu a bezpečný manage odkaz.
          </p>
          <div className="mt-4 grid gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="confirmationMessage">Text potvrzení</label>
              <textarea
                id="confirmationMessage"
                name="confirmationMessage"
                maxLength={500}
                rows={3}
                defaultValue={tenant.confirmation_message ?? ""}
                placeholder="Např. Přijďte prosím 5 minut předem. Parkování je za rohem."
                className={textareaClassName}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="reminderMessage">Text připomínky</label>
              <textarea
                id="reminderMessage"
                name="reminderMessage"
                maxLength={500}
                rows={3}
                defaultValue={tenant.reminder_message ?? ""}
                placeholder="Např. Pokud víte, že nestíháte, změňte termín přes odkaz v e-mailu."
                className={textareaClassName}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="cancellationMessage">Text zrušení</label>
              <textarea
                id="cancellationMessage"
                name="cancellationMessage"
                maxLength={500}
                rows={3}
                defaultValue={tenant.cancellation_message ?? ""}
                placeholder="Např. Pokud chcete nový termín, rezervujte se znovu přes náš online odkaz."
                className={textareaClassName}
              />
            </div>
          </div>
        </div>
      </div>
      {state.error ? (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm font-medium text-success">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={isPending} className="mt-5">
        {isPending ? "Ukládám..." : "Uložit booking stránku"}
      </Button>
    </form>
  );
}
