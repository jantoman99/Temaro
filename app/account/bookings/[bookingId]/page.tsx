import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { logoutAction } from "@/app/(auth)/actions";
import {
  cancelCustomerBookingAction,
  rescheduleCustomerBookingAction,
} from "@/app/account/bookings/[bookingId]/actions";
import { TemaroLogo } from "@/components/brand/temaro-logo";
import { Button } from "@/components/ui/button";
import { getAvailabilitySlots } from "@/lib/booking/availability";
import { getSelfServiceCancellationState } from "@/lib/booking/self-service";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { formatDateTimeForDisplay } from "@/lib/date-format";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { getSafeAppLocale } from "@/lib/locale";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSafeTimeZone } from "@/lib/time-zone";

type CustomerBookingDetail = {
  id: string;
  tenant_id: string;
  service_id: string;
  staff_id: string;
  starts_at: string;
  ends_at: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  deposit_amount: number;
  deposit_paid: boolean;
  deposit_paid_at: string | null;
  source: string | null;
  services: { currency: "CZK" | "EUR"; duration_minutes: number; name: string; price: number } | null;
  staff: { name: string } | null;
  tenants: {
    cancellation_notice_hours: number | null;
    locale: string | null;
    name: string;
    slug: string;
    timezone: string;
  } | null;
};

type CustomerBookingDetailPageProps = {
  params: Promise<{
    bookingId: string;
  }>;
  searchParams: Promise<{
    cancellation?: string;
    reschedule?: string;
  }>;
};

const bookingIdSchema = z.string().uuid();

function getStatusLabel(status: CustomerBookingDetail["status"]) {
  const labels = {
    cancelled: "Zrušeno",
    completed: "Dokončeno",
    confirmed: "Potvrzeno",
    no_show: "Nedorazil/a",
    pending: "Čeká na potvrzení",
  };

  return labels[status];
}

function getNextStep(booking: CustomerBookingDetail) {
  if (booking.status === "cancelled") return "Rezervace je zrušená. Pro nový termín otevřete booking stránku podniku.";
  if (booking.status === "completed") return "Návštěva je dokončená. Pokud podnik posílá žádost o recenzi, přijde e-mailem.";
  if (booking.status === "no_show") return "Rezervace je označená jako nedorazil/a. Další postup řešte přímo s podnikem.";
  if (booking.status === "pending") return "Rezervace čeká na potvrzení podniku.";
  if (booking.deposit_amount > 0 && !booking.deposit_paid) return "Rezervace je potvrzená, ale záloha zatím čeká na úhradu.";

  return "Rezervace je potvrzená. Změny a storno řešte přes manage odkaz z e-mailu nebo přímo s podnikem.";
}

function CancellationStatusMessage({ status }: { status?: string }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
        Rezervace byla zrušena.
      </div>
    );
  }

  if (status === "too-late") {
    return (
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-900">
        Online storno už není podle pravidel podniku možné.
      </div>
    );
  }

  if (status === "forbidden" || status === "error") {
    return (
      <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
        Rezervaci se nepodařilo zrušit. Zkuste to prosím znovu nebo kontaktujte podnik.
      </div>
    );
  }

  return null;
}

function RescheduleStatusMessage({ status }: { status?: string }) {
  if (status === "success") {
    return (
      <div className="rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
        Rezervace byla přesunuta.
      </div>
    );
  }

  if (status === "too-late") {
    return (
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-900">
        Online přesun už není podle pravidel podniku možný.
      </div>
    );
  }

  if (status === "same") {
    return (
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-900">
        Vyberte jiný termín než aktuální.
      </div>
    );
  }

  if (status === "forbidden" || status === "error") {
    return (
      <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
        Rezervaci se nepodařilo přesunout. Vyberte jiný termín nebo kontaktujte podnik.
      </div>
    );
  }

  return null;
}

async function getCustomerBookingDetail(email: string, bookingId: string) {
  if (!hasSupabaseAdminEnv()) {
    return { booking: null, missingAdminEnv: true };
  }

  const admin = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  const { data: clients, error: clientsError } = await admin
    .from("clients")
    .select("id")
    .ilike("email", normalizedEmail)
    .is("deleted_at", null)
    .limit(100);

  if (clientsError || !clients?.length) {
    return { booking: null, missingAdminEnv: false };
  }

  const { data: booking, error: bookingError } = await admin
    .from("bookings")
    .select("id, tenant_id, service_id, staff_id, starts_at, ends_at, status, deposit_amount, deposit_paid, deposit_paid_at, source, services(name, price, currency, duration_minutes), staff(name), tenants(name, slug, timezone, locale, cancellation_notice_hours)")
    .eq("id", bookingId)
    .in("client_id", clients.map((client) => client.id))
    .maybeSingle();

  if (bookingError) {
    return { booking: null, missingAdminEnv: false };
  }

  return {
    booking: booking as CustomerBookingDetail | null,
    missingAdminEnv: false,
  };
}

export default async function CustomerBookingDetailPage({ params, searchParams }: CustomerBookingDetailPageProps) {
  const { bookingId } = await params;
  const { cancellation, reschedule } = await searchParams;
  const parsedBookingId = bookingIdSchema.safeParse(bookingId);

  if (!parsedBookingId.success) {
    notFound();
  }

  if (!hasSupabaseEnv()) {
    redirect("/account");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/account/login");
  }

  const { booking, missingAdminEnv } = await getCustomerBookingDetail(user.email, parsedBookingId.data);

  if (!booking && !missingAdminEnv) {
    notFound();
  }

  const tenant = booking?.tenants ?? null;
  const service = booking?.services ?? null;
  const timeZone = getSafeTimeZone(tenant?.timezone);
  const locale = getSafeAppLocale(tenant?.locale);
  const currency = service?.currency ?? "CZK";
  const cancellationState = booking ? getSelfServiceCancellationState(booking) : null;
  const canCancel = booking
    ? (booking.status === "pending" || booking.status === "confirmed") && cancellationState?.canCancel
    : false;
  const canReschedule = canCancel;
  let availableSlots: { id: string; label: string; staffId: string; staffName: string; startsAt: string }[] = [];

  if (booking && canReschedule && hasSupabaseAdminEnv()) {
    const admin = createAdminClient();
    const [
      { data: fullService },
      { data: staff },
      { data: activeBookings },
    ] = await Promise.all([
      admin
        .from("services")
        .select("*")
        .eq("tenant_id", booking.tenant_id)
        .eq("id", booking.service_id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .single(),
      admin
        .from("staff")
        .select("*, staff_hours(*), staff_exceptions(*), staff_services(*)")
        .eq("tenant_id", booking.tenant_id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("name", { ascending: true }),
      admin
        .from("bookings")
        .select("id, staff_id, starts_at, ends_at, status")
        .eq("tenant_id", booking.tenant_id)
        .in("status", ["pending", "confirmed"])
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true }),
    ]);

    availableSlots = getAvailabilitySlots({
      bookings: (activeBookings ?? []).filter((item) => item.id !== booking.id),
      daysAhead: 14,
      locale,
      services: fullService ? [fullService] : [],
      staff: staff ?? [],
      timeZone,
    })
      .slice(0, 24)
      .map((slot) => ({
        ...slot,
        staffName: staff?.find((member) => member.id === slot.staffId)?.name ?? "Poskytovatel",
      }));
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TemaroLogo />
          <form action={logoutAction}>
            <Button type="submit" variant="outline">
              Odhlásit
            </Button>
          </form>
        </div>

        <Link href="/account" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
          Zpět na rezervace
        </Link>

        <CancellationStatusMessage status={cancellation} />
        <RescheduleStatusMessage status={reschedule} />

        {missingAdminEnv ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em]">Chybí serverová konfigurace</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Detail rezervace není dostupný</h1>
            <p className="mt-3 text-sm font-medium leading-6">
              Zákaznický detail vyžaduje Supabase service role klíč na serveru.
            </p>
          </section>
        ) : null}

        {booking ? (
          <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border/70 bg-gradient-to-r from-primary/10 via-card to-accent/10 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Detail rezervace</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{service?.name ?? "Rezervace"}</h1>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                {tenant?.name ?? "Podnik"} · {formatDateTimeForDisplay(booking.starts_at, timeZone)}
              </p>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Stav</p>
                <p className="mt-1 text-lg font-semibold">{getStatusLabel(booking.status)}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Termín</p>
                <p className="mt-1 text-lg font-semibold">{formatDateTimeForDisplay(booking.starts_at, timeZone)}</p>
                <p className="mt-1 text-sm text-muted-foreground">Konec: {formatDateTimeForDisplay(booking.ends_at, timeZone)}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Poskytovatel</p>
                <p className="mt-1 text-lg font-semibold">{booking.staff?.name ?? "Podle podniku"}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Délka</p>
                <p className="mt-1 text-lg font-semibold">{service?.duration_minutes ? `${service.duration_minutes} min` : "Dle služby"}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Cena</p>
                <p className="mt-1 text-lg font-semibold">{service ? formatCurrencyForDisplay(service.price, currency, 2) : "Dle služby"}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Záloha</p>
                <p className="mt-1 text-lg font-semibold">
                  {booking.deposit_amount > 0
                    ? `${formatCurrencyForDisplay(booking.deposit_amount, currency, 2)} · ${booking.deposit_paid ? "zaplaceno" : "čeká"}`
                    : "Bez zálohy"}
                </p>
                {booking.deposit_paid_at ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Zaplaceno: {formatDateTimeForDisplay(booking.deposit_paid_at, timeZone)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="border-t border-border/70 p-5">
              <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Další krok</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-foreground">{getNextStep(booking)}</p>
                {tenant?.cancellation_notice_hours && tenant.cancellation_notice_hours > 0 ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Online změna nebo zrušení se řídí storno lhůtou {tenant.cancellation_notice_hours} hodin před termínem.
                  </p>
                ) : null}
              </div>

              {tenant?.slug ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/${tenant.slug}`}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                  >
                    Rezervovat další termín
                  </Link>
                  <Link
                    href="/account"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-semibold shadow-sm transition hover:bg-muted"
                  >
                    Zpět na přehled
                  </Link>
                </div>
              ) : null}

              {booking.status === "pending" || booking.status === "confirmed" ? (
                <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    Přesun rezervace
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Vyberte nový nejbližší volný termín pro stejnou službu. Přesun se řídí stejnou storno lhůtou jako zrušení.
                  </p>
                  {!canReschedule && cancellationState?.reason ? (
                    <p className="mt-3 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-900">
                      {cancellationState.reason}
                    </p>
                  ) : null}
                  <form action={rescheduleCustomerBookingAction} className="mt-4 grid gap-3">
                    <input type="hidden" name="bookingId" value={booking.id} />
                    {availableSlots.length > 0 ? (
                      <select
                        name="slotChoice"
                        className="h-11 rounded-md border border-border bg-background px-3 text-sm font-semibold shadow-sm"
                        disabled={!canReschedule}
                      >
                        {availableSlots.map((slot) => (
                          <option key={slot.id} value={`${slot.staffId}|${slot.startsAt}`}>
                            {slot.label} · {slot.staffName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="rounded-md border border-dashed border-border bg-background px-3 py-3 text-sm font-semibold text-muted-foreground">
                        Teď nejsou k dispozici jiné volné termíny.
                      </p>
                    )}
                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={!canReschedule || availableSlots.length === 0}
                    >
                      Přesunout rezervaci
                    </Button>
                  </form>
                </div>
              ) : null}

              {booking.status === "pending" || booking.status === "confirmed" ? (
                <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-destructive/80">
                    Storno rezervace
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Zrušení je trvalé. Pokud je storno lhůta překročená, kontaktujte podnik přímo.
                  </p>
                  {!canCancel && cancellationState?.reason ? (
                    <p className="mt-3 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-900">
                      {cancellationState.reason}
                    </p>
                  ) : null}
                  <form action={cancelCustomerBookingAction} className="mt-4">
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <Button
                      type="submit"
                      variant="destructive"
                      className="w-full sm:w-auto"
                      disabled={!canCancel}
                    >
                      {canCancel ? "Zrušit rezervaci" : "Storno už nejde online"}
                    </Button>
                  </form>
                </div>
              ) : null}
            </div>
          </article>
        ) : null}
      </section>
    </main>
  );
}
