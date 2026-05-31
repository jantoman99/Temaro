import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ManageBookingForm } from "@/components/booking/manage-booking-form";
import { getAvailabilitySlots } from "@/lib/booking/availability";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { formatDateTimeForDisplay } from "@/lib/date-format";
import { demoBookings, demoTenant } from "@/lib/demo/data";
import { hasStripeCheckoutEnv, hasSupabaseAdminEnv } from "@/lib/env";
import { getSafeAppLocale } from "@/lib/locale";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSafeTimeZone } from "@/lib/time-zone";
import { bookingManageTokenSchema } from "@/lib/validations/bookings";
import {
  getBookingBySelfServiceToken,
  getSelfServiceCancellationState,
} from "@/lib/booking/self-service";

type ManageBookingPageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    payment?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  referrer: "no-referrer",
};

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    cancelled: "zrušeno",
    completed: "dokončeno",
    confirmed: "potvrzeno",
    no_show: "no-show",
    pending: "čeká na potvrzení",
  };

  return labels[status] ?? status;
}

function getStatusClasses(status: string) {
  const classes: Record<string, string> = {
    cancelled: "border-border bg-muted text-muted-foreground",
    completed: "border-success/25 bg-success/10 text-emerald-800",
    confirmed: "border-primary/25 bg-primary/10 text-primary",
    no_show: "border-destructive/25 bg-destructive/10 text-destructive",
    pending: "border-warning/30 bg-warning/15 text-amber-800",
  };

  return classes[status] ?? "border-border bg-muted text-muted-foreground";
}

function PaymentStatusMessage({ payment }: { payment?: string }) {
  if (payment === "success") {
    return (
      <div className="mb-4 rounded-2xl border border-success/25 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
        Platba byla přijata. Pokud se stav ještě nepropsal, stránku za chvíli obnovte.
      </div>
    );
  }

  if (payment === "cancelled") {
    return (
      <div className="mb-4 rounded-2xl border border-warning/30 bg-warning/15 px-4 py-3 text-sm font-semibold text-amber-800">
        Platba nebyla dokončena. Rezervace zůstává beze změny.
      </div>
    );
  }

  return null;
}

function DepositPaymentCard({
  currency,
  depositAmount,
  depositPaid,
  policyMessage,
  token,
}: {
  currency: string;
  depositAmount: number;
  depositPaid: boolean;
  policyMessage?: string | null;
  token: string;
}) {
  if (depositAmount <= 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Záloha</p>
      <p className="nums-tabular mt-2 text-2xl font-semibold tracking-tight">
        {formatCurrencyForDisplay(depositAmount, currency, 2)}
      </p>
      <p className="mt-2 text-sm font-medium text-muted-foreground">
        {depositPaid ? "Záloha je zaplacená." : "Zálohu můžete zaplatit online kartou přes zabezpečený Stripe Checkout."}
      </p>
      {policyMessage ? (
        <p className="mt-3 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-semibold leading-5 text-amber-900">
          {policyMessage}
        </p>
      ) : null}
      {!depositPaid && hasStripeCheckoutEnv() ? (
        <form action="/api/payments/stripe/checkout" method="post" className="mt-4">
          <input type="hidden" name="token" value={token} />
          <button className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
            Zaplatit zálohu online
          </button>
        </form>
      ) : null}
      {!depositPaid && !hasStripeCheckoutEnv() ? (
        <p className="mt-3 rounded-md border border-border bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
          Online platba zatím není u tohoto podniku zapnutá.
        </p>
      ) : null}
    </section>
  );
}

export default async function ManageBookingPage({ params, searchParams }: ManageBookingPageProps) {
  const { token } = await params;
  const { payment } = await searchParams;
  const parsedToken = bookingManageTokenSchema.safeParse({ token });

  if (!parsedToken.success) {
    notFound();
  }

  if (!hasSupabaseAdminEnv()) {
    const booking = demoBookings[0];
    const timeZone = getSafeTimeZone(demoTenant.timezone);

    if (!booking) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-4xl">
          <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="bg-card px-5 py-8 text-center sm:px-8 sm:py-10">
              <div className="mx-auto mb-5 grid size-14 place-items-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
                {demoTenant.name.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Správa rezervace
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{demoTenant.name}</h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                Demo režim veřejné správy rezervace. V produkci je přístup řízený bezpečným tokenem z emailu.
              </p>
            </div>
            <dl className="grid gap-3 p-4 text-sm sm:grid-cols-3 sm:p-6">
              <div className="rounded-lg border border-border bg-background/70 p-4 shadow-sm">
                <dt className="text-xs text-muted-foreground">Klient</dt>
                <dd className="mt-1 font-medium">{booking.clients?.full_name ?? "Klient"}</dd>
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-4 shadow-sm">
                <dt className="text-xs text-muted-foreground">Služba</dt>
                <dd className="mt-1 font-medium">{booking.services?.name ?? "Služba"}</dd>
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-4 shadow-sm">
                <dt className="text-xs text-muted-foreground">Termín</dt>
                <dd className="mt-1 font-medium">{formatDateTimeForDisplay(booking.starts_at, timeZone)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </main>
    );
  }

  const supabase = createAdminClient();
  let booking: Awaited<ReturnType<typeof getBookingBySelfServiceToken>>;

  try {
    booking = await getBookingBySelfServiceToken(supabase, parsedToken.data.token);
  } catch {
    notFound();
  }

  if (!booking) {
    notFound();
  }

  const cancellationState = getSelfServiceCancellationState(booking);
  const timeZone = getSafeTimeZone(booking.tenants?.timezone);
  const locale = getSafeAppLocale(booking.tenants?.locale);
  const [
    { data: service, error: serviceError },
    { data: staff, error: staffError },
    { data: bookings, error: bookingsError },
  ] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("tenant_id", booking.tenant_id)
      .eq("id", booking.service_id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("staff")
      .select("*, staff_hours(*), staff_exceptions(*), staff_services(*)")
      .eq("tenant_id", booking.tenant_id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("bookings")
      .select("id, staff_id, starts_at, ends_at, status")
      .eq("tenant_id", booking.tenant_id)
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true }),
  ]);
  const hasLoadError = Boolean(serviceError || staffError || bookingsError);
  const availableSlots = getAvailabilitySlots({
    bookings: (bookings ?? []).filter((item) => item.id !== booking.id),
    daysAhead: 14,
    locale,
    services: service ? [service] : [],
    staff: staff ?? [],
    timeZone,
  })
    .slice(0, 24)
    .map((slot) => ({
      ...slot,
      staffName: staff?.find((member) => member.id === slot.staffId)?.name ?? "Poskytovatel",
    }));

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="bg-card px-5 py-8 text-center sm:px-8 sm:py-10">
            <div className="mx-auto mb-5 grid size-14 place-items-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
              {(booking.tenants?.name ?? "Podnik").slice(0, 2).toUpperCase()}
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Správa rezervace
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {booking.tenants?.name ?? "Podnik"}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              Zkontrolujte detail termínu, vyberte nový čas nebo rezervaci zrušte podle pravidel podniku.
            </p>
          </div>

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="grid gap-4">
              <PaymentStatusMessage payment={payment} />
              <div className="rounded-lg border border-border bg-background/70 p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Aktuální termín
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      {formatDateTimeForDisplay(booking.starts_at, timeZone)}
                    </h2>
                  </div>
                  <span
                    className={`inline-flex w-fit items-center rounded-md border px-3 py-1 text-xs font-semibold ${getStatusClasses(booking.status)}`}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {booking.tenants?.cancellation_notice_hours && booking.tenants.cancellation_notice_hours > 0
                    ? `Online zrušení je možné nejpozději ${booking.tenants.cancellation_notice_hours} hodin před termínem.`
                    : "Online zrušení není časově omezené až do začátku termínu."}
                </p>
              </div>

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <dt className="text-xs text-muted-foreground">Klient</dt>
              <dd className="mt-1 font-medium">{booking.clients?.full_name ?? "Klient"}</dd>
              {booking.clients?.email ? <dd className="mt-1 text-muted-foreground">{booking.clients.email}</dd> : null}
              {booking.clients?.phone ? <dd className="mt-1 text-muted-foreground">{booking.clients.phone}</dd> : null}
            </div>
                <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <dt className="text-xs text-muted-foreground">Služba</dt>
              <dd className="mt-1 font-medium">{booking.services?.name ?? "Služba"}</dd>
            </div>
                <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <dt className="text-xs text-muted-foreground">Poskytovatel</dt>
              <dd className="mt-1 font-medium">{booking.staff?.name ?? "Poskytovatel"}</dd>
            </div>
            {booking.notes ? (
                  <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Poznámka</dt>
                <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">{booking.notes}</dd>
              </div>
            ) : null}
          </dl>
            </div>

            <aside className="lg:-mt-2">
              <div className="mb-4">
                <DepositPaymentCard
                  currency={booking.services?.currency ?? "CZK"}
                  depositAmount={booking.deposit_amount}
                  depositPaid={booking.deposit_paid}
                  policyMessage={cancellationState.depositPolicy}
                  token={parsedToken.data.token}
                />
              </div>
              {hasLoadError ? (
                <div className="mb-4 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                  Dostupné termíny pro změnu rezervace se nepodařilo načíst. Zkuste stránku obnovit.
                </div>
              ) : null}

              {booking.status === "pending" || booking.status === "confirmed" ? (
                <ManageBookingForm
                  token={parsedToken.data.token}
                  cancellationAllowed={cancellationState.canCancel}
                  cancellationMessage={cancellationState.reason}
                  rescheduleAllowed={cancellationState.canCancel}
                  rescheduleMessage={cancellationState.canCancel ? null : cancellationState.reason}
                  slots={availableSlots}
                />
              ) : (
                <p className="rounded-lg border border-border bg-muted px-4 py-4 text-sm font-medium text-muted-foreground shadow-sm">
                  Tuto rezervaci už není možné přes tento odkaz měnit.
                </p>
              )}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
