import Link from "next/link";
import type { CSSProperties } from "react";

import { getBaseAppUrl } from "@/lib/app-url";
import { getBookingPageReadiness } from "@/lib/onboarding/booking-page-readiness";
import type { Database } from "@/types/database";

type Tenant = Pick<
  Database["public"]["Tables"]["tenants"]["Row"],
  "brand_color" | "cover_image_url" | "locale" | "logo_url" | "name" | "public_description" | "slug" | "timezone"
>;

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function BookingPagePreview({
  serviceAssignmentsCount = 0,
  servicesCount,
  staffCount,
  tenant,
  workingHoursCount = 0,
}: {
  serviceAssignmentsCount?: number;
  servicesCount: number;
  staffCount: number;
  tenant: Tenant;
  workingHoursCount?: number;
}) {
  const bookingUrl = `${getBaseAppUrl()}/${tenant.slug}`;
  const brandColor = tenant.brand_color ?? "#635BFF";
  const readiness = getBookingPageReadiness({
    serviceAssignmentsCount,
    servicesCount,
    staffCount,
    workingHoursCount,
  });
  const publicDescription =
    tenant.public_description ??
    "Vyberte službu, poskytovatele a termín. Rezervace se uloží přímo do kalendáře podniku.";

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Náhled zákazníka</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Veřejná rezervační stránka</h2>
        </div>
        <Link
          href={`/${tenant.slug}`}
          target="_blank"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Otevřít stránku
        </Link>
      </div>
      <div className="border-b border-border bg-background px-5 py-4">
        <div className={`rounded-2xl border p-4 ${readiness.canReceiveBookings ? "border-success/30 bg-success/10" : "border-amber-500/30 bg-amber-500/10"}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Připravenost stránky</p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">{readiness.headline}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{readiness.text}</p>
            </div>
            <Link
              href={readiness.nextHref}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
            >
              {readiness.canReceiveBookings ? "Upravit tým" : "Doplnit krok"}
            </Link>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {readiness.checks.map((check) => (
              <Link
                key={check.label}
                href={check.href}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm ${
                  check.done ? "border-success/30 bg-card text-success" : "border-amber-500/30 bg-card text-amber-800"
                }`}
              >
                {check.done ? "Hotovo" : "Chybí"} · {check.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-0 lg:grid-cols-[0.82fr_1.18fr]">
        <div
          className="relative min-h-[360px] overflow-hidden bg-sidebar p-6 text-white"
          style={{ "--tenant-brand": brandColor } as CSSProperties}
        >
          {tenant.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-35"
              src={tenant.cover_image_url}
            />
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--tenant-brand),transparent_34%),linear-gradient(135deg,rgba(7,12,20,0.98),rgba(18,24,38,0.88))]" />
          <div className="relative">
            {tenant.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={`${tenant.name} logo`} className="mb-6 size-14 rounded-2xl border border-white/15 bg-white object-cover p-1" src={tenant.logo_url} />
            ) : (
              <div className="mb-6 grid size-14 place-items-center rounded-2xl text-base font-black text-white shadow-md" style={{ backgroundColor: brandColor }}>
                {getInitials(tenant.name)}
              </div>
            )}
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/62">Online rezervace</p>
            <h3 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight">
              Rezervovat se k <span className="font-serif-accent">{tenant.name}</span>
            </h3>
            <p className="mt-4 max-w-md text-base font-medium leading-7 text-white/70">{publicDescription}</p>
            <div className="mt-7 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/8 p-3">
                <p className="nums-tabular text-xl font-semibold">{servicesCount}</p>
                <p className="mt-1 text-xs font-bold text-white/55">služeb</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/8 p-3">
                <p className="nums-tabular text-xl font-semibold">{staffCount}</p>
                <p className="mt-1 text-xs font-bold text-white/55">lidí</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/8 p-3">
                <p className="text-xl font-semibold">{tenant.locale.toUpperCase()}</p>
                <p className="mt-1 truncate text-xs font-bold text-white/55">{tenant.timezone}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-background p-5">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Jak rezervace proběhne</p>
            <div className="mt-4 grid gap-3">
              {["Vybrat službu", "Vybrat termín", "Doplnit kontakt"].map((label, index) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-3">
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="grid size-7 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: brandColor }}>
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-5 break-all rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground">
              {bookingUrl}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
