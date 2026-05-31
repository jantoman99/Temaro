"use client";

import { useActionState, useMemo, useState } from "react";

import { updateTenantSettingsAction } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { getBaseAppUrl } from "@/lib/app-url";
import { getSafeCurrency } from "@/lib/currency";
import { getSafeAppLocale } from "@/lib/locale";
import {
  CANCELLATION_NOTICE_HOURS_MAX,
  CANCELLATION_NOTICE_HOURS_MIN,
  TENANT_NAME_MAX_LENGTH,
} from "@/lib/settings-form-limits";
import { TENANT_INDUSTRIES } from "@/lib/tenant-industry";
import { getSafeTimeZone } from "@/lib/time-zone";
import type { Database } from "@/types/database";

type Tenant = Database["public"]["Tables"]["tenants"]["Row"];

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";
const sectionClassName = "rounded-lg border border-border bg-secondary p-4 shadow-sm";

export function TenantSettingsForm({ tenant }: { tenant: Tenant }) {
  const [state, formAction, isPending] = useActionState(updateTenantSettingsAction, initialState);
  const [copyState, setCopyState] = useState("");
  const bookingUrl = useMemo(() => {
    return `${getBaseAppUrl()}/${tenant.slug}`;
  }, [tenant.slug]);

  async function handleCopyBookingUrl() {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopyState("Zkopírováno");
    } catch {
      setCopyState("Kopírování se nepodařilo");
    }
  }

  return (
    <form action={formAction} className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="grid gap-5">
        <div className={sectionClassName}>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Identita podniku
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="name">
              Název podniku
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={TENANT_NAME_MAX_LENGTH}
              autoComplete="organization"
              defaultValue={tenant.name}
              className={inputClassName}
            />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="industry">
              Obor podniku
            </label>
            <select
              id="industry"
              name="industry"
              defaultValue={tenant.industry}
              className={inputClassName}
            >
              {TENANT_INDUSTRIES.map((industry) => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">
              Použije se pro veřejný katalog, segmentové landing pages a pozdější doporučování podniků.
            </p>
          </div>
        </div>

        <div className={sectionClassName}>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Lokalizace
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="timezone">
              Časová zóna
            </label>
            <select
              id="timezone"
              name="timezone"
              defaultValue={getSafeTimeZone(tenant.timezone)}
              className={inputClassName}
            >
              <option value="Europe/Prague">Europe/Prague</option>
              <option value="Europe/Bratislava">Europe/Bratislava</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="locale">
              Jazyk
            </label>
            <select
              id="locale"
              name="locale"
              defaultValue={getSafeAppLocale(tenant.locale)}
              className={inputClassName}
            >
              <option value="cs">Čeština</option>
              <option value="sk">Slovenština</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="defaultCurrency">
              Výchozí měna
            </label>
            <select
              id="defaultCurrency"
              name="defaultCurrency"
              defaultValue={getSafeCurrency(tenant.default_currency)}
              className={inputClassName}
            >
              <option value="CZK">CZK</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          </div>
        </div>

        <div className={sectionClassName}>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Veřejný katalog a mapa
            </p>
            <p className="text-sm text-muted-foreground">
              Základ pro vyhledání podle oboru, města a zobrazení polohy podniku bez externí mapové integrace.
            </p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-sm font-medium text-foreground" htmlFor="publicAddress">
                Veřejná adresa
              </label>
              <input
                id="publicAddress"
                name="publicAddress"
                maxLength={180}
                autoComplete="street-address"
                defaultValue={tenant.public_address ?? ""}
                className={inputClassName}
                placeholder="Např. Kobližná 12"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="publicCity">
                Město
              </label>
              <input
                id="publicCity"
                name="publicCity"
                maxLength={90}
                autoComplete="address-level2"
                defaultValue={tenant.public_city ?? ""}
                className={inputClassName}
                placeholder="Brno"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="publicRegion">
                Lokalita / kraj
              </label>
              <input
                id="publicRegion"
                name="publicRegion"
                maxLength={90}
                autoComplete="address-level1"
                defaultValue={tenant.public_region ?? ""}
                className={inputClassName}
                placeholder="Jihomoravský kraj"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="publicPostalCode">
                PSČ
              </label>
              <input
                id="publicPostalCode"
                name="publicPostalCode"
                maxLength={20}
                autoComplete="postal-code"
                defaultValue={tenant.public_postal_code ?? ""}
                className={inputClassName}
                placeholder="602 00"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="publicCountryCode">
                Země
              </label>
              <input
                id="publicCountryCode"
                name="publicCountryCode"
                maxLength={2}
                autoComplete="country"
                defaultValue={tenant.public_country_code ?? "CZ"}
                className={inputClassName}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-sm font-medium text-foreground" htmlFor="publicMapUrl">
                Vlastní odkaz na mapu
              </label>
              <input
                id="publicMapUrl"
                name="publicMapUrl"
                type="url"
                maxLength={500}
                autoComplete="url"
                defaultValue={tenant.public_map_url ?? ""}
                className={inputClassName}
                placeholder="https://maps.google.com/..."
              />
              <p className="text-sm text-muted-foreground">
                Pokud odkaz nevyplníte, veřejná stránka vytvoří bezpečný odkaz na mapové vyhledání podle adresy.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="publicLatitude">
                Zeměpisná šířka
              </label>
              <input
                id="publicLatitude"
                name="publicLatitude"
                inputMode="decimal"
                defaultValue={tenant.public_latitude ?? ""}
                className={inputClassName}
                placeholder="49.1951"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="publicLongitude">
                Zeměpisná délka
              </label>
              <input
                id="publicLongitude"
                name="publicLongitude"
                inputMode="decimal"
                defaultValue={tenant.public_longitude ?? ""}
                className={inputClassName}
                placeholder="16.6068"
              />
            </div>
          </div>
          <label className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="isPubliclyListed"
              defaultChecked={tenant.is_publicly_listed}
              className="mt-1 size-4 rounded border-input accent-primary"
            />
            <span>
              Zobrazit podnik ve veřejném katalogu
              <span className="mt-1 block text-sm font-normal text-muted-foreground">
                Katalog bude používat jen veřejná pole: název, město, popis, logo a booking odkaz.
              </span>
            </span>
          </label>
        </div>

        <div className={sectionClassName}>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recenze
            </p>
            <p className="text-sm text-muted-foreground">
              Uložte veřejný odkaz na Google recenze nebo jiný review profil. Automatické odesílání žádostí přijde až později.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="reviewUrl">
              Odkaz na recenze
            </label>
            <input
              id="reviewUrl"
              name="reviewUrl"
              type="url"
              maxLength={500}
              autoComplete="url"
              defaultValue={tenant.review_url ?? ""}
              className={inputClassName}
              placeholder="https://g.page/r/..."
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="reviewRating">
                Veřejné hodnocení
              </label>
              <input
                id="reviewRating"
                name="reviewRating"
                inputMode="decimal"
                defaultValue={tenant.review_rating ?? ""}
                className={inputClassName}
                placeholder="4.8"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="reviewCount">
                Počet recenzí
              </label>
              <input
                id="reviewCount"
                name="reviewCount"
                inputMode="numeric"
                defaultValue={tenant.review_count ?? 0}
                className={inputClassName}
                placeholder="128"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="reviewSourceLabel">
                Zdroj
              </label>
              <input
                id="reviewSourceLabel"
                name="reviewSourceLabel"
                maxLength={80}
                defaultValue={tenant.review_source_label ?? ""}
                className={inputClassName}
                placeholder="Google"
              />
            </div>
          </div>
        </div>

        <div className={sectionClassName}>
          <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="cancellationNoticeHours">
            Storno lhůta v hodinách
          </label>
          <input
            id="cancellationNoticeHours"
            name="cancellationNoticeHours"
            type="number"
            inputMode="numeric"
            min={CANCELLATION_NOTICE_HOURS_MIN}
            max={CANCELLATION_NOTICE_HOURS_MAX}
            step={1}
            required
            defaultValue={tenant.cancellation_notice_hours}
            className={inputClassName}
          />
          <p className="text-sm text-muted-foreground">
            0 znamená bez omezení. Například 24 = klient může rušit nejpozději 24 hodin před termínem.
          </p>
          </div>
        </div>

        <div className={sectionClassName}>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Booking URL
          </p>
          <p className="mt-3 break-all rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm">
            {bookingUrl}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`/${tenant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center rounded-md border border-border bg-card px-3 text-sm font-semibold shadow-sm transition hover:bg-muted"
            >
              Otevřít
            </a>
            <Button type="button" variant="outline" size="sm" onClick={handleCopyBookingUrl}>
              Zkopírovat
            </Button>
            {copyState ? <span className="self-center text-sm font-medium text-muted-foreground">{copyState}</span> : null}
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
        {isPending ? "Ukládám..." : "Uložit nastavení"}
      </Button>
    </form>
  );
}
