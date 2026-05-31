import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { PosCheckoutForm } from "@/components/pos/pos-checkout-form";
import { requireOwner } from "@/lib/auth/require-owner";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { formatDateTimeForDisplay } from "@/lib/date-format";
import { demoBookings, demoServices, demoStaff } from "@/lib/demo/data";
import { hasSupabaseEnv } from "@/lib/env";
import { getPaidTotal, getRemainingAmount } from "@/lib/pos/checkout";
import { getUtcDayRangeForTimeZone } from "@/lib/time-zone";

export const dynamic = "force-dynamic";

type PosBooking = {
  id: string;
  starts_at: string;
  status: string;
  booking_payments: Array<{ amount: number; status: string }>;
  clients: { full_name: string | null; phone: string | null } | null;
  services: { currency: string; name: string | null; price: number } | null;
  staff: { name: string | null } | null;
};

function PosHeader() {
  return (
    <PageHeader
      description="Rychlá pokladna pro zaevidování doplatku nebo celé platby po návštěvě. Zápis se propíše do Plateb i Reportů."
      eyebrow="Business suite"
      title="POS pokladna"
    />
  );
}

function PosBookingsList({ bookings, timeZone }: { bookings: PosBooking[]; timeZone: string }) {
  if (bookings.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Žádné rezervace k vyúčtování</h2>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          Pokladna ukazuje dnešní potvrzené, čekající a dokončené rezervace s nezaplaceným zůstatkem.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      {bookings.map((booking) => {
        const servicePrice = booking.services?.price ?? 0;
        const paidTotal = getPaidTotal(booking.booking_payments);
        const remainingAmount = getRemainingAmount({
          payments: booking.booking_payments,
          servicePrice,
        });
        const currency = booking.services?.currency ?? "CZK";

        return (
          <article key={booking.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[1fr_280px] lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  {formatDateTimeForDisplay(booking.starts_at, timeZone)}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">{booking.services?.name ?? "Služba"}</h2>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {booking.clients?.full_name ?? "Walk-in"} · {booking.staff?.name ?? "Bez zaměstnance"}
                </p>
                {booking.clients?.phone ? <p className="mt-1 text-sm text-muted-foreground">{booking.clients.phone}</p> : null}
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Cena</p>
                    <p className="mt-1 font-semibold">{formatCurrencyForDisplay(servicePrice, currency, 2)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Zaplaceno</p>
                    <p className="mt-1 font-semibold">{formatCurrencyForDisplay(paidTotal, currency, 2)}</p>
                  </div>
                  <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Doplatek</p>
                    <p className="mt-1 font-semibold">{formatCurrencyForDisplay(remainingAmount, currency, 2)}</p>
                  </div>
                </div>
              </div>
              <PosCheckoutForm bookingId={booking.id} />
            </div>
          </article>
        );
      })}
    </section>
  );
}

function getDemoPosBookings(): PosBooking[] {
  return demoBookings.slice(0, 3).map((booking) => {
    const service = demoServices.find((item) => item.id === booking.service_id) ?? null;
    const staff = demoStaff.find((item) => item.id === booking.staff_id) ?? null;

    return {
      booking_payments: [],
      clients: { full_name: "Demo klient", phone: "+420777123456" },
      id: booking.id,
      services: service ? { currency: service.currency, name: service.name, price: service.price } : null,
      staff: staff ? { name: staff.name } : null,
      starts_at: booking.starts_at,
      status: booking.status,
    };
  });
}

export default async function PosPage() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <PosHeader />
        <PosBookingsList bookings={getDemoPosBookings()} timeZone="Europe/Prague" />
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const { data: tenant } = await auth.supabase
    .from("tenants")
    .select("timezone")
    .eq("id", auth.tenantId)
    .is("deleted_at", null)
    .maybeSingle();
  const timeZone = tenant?.timezone ?? "Europe/Prague";
  const dayRange = getUtcDayRangeForTimeZone(new Date(), timeZone);
  const { data: bookings } = await auth.supabase
    .from("bookings")
    .select(
      `
        id,
        starts_at,
        status,
        clients!bookings_client_tenant_fkey(full_name, phone),
        services!bookings_service_tenant_fkey(name, price, currency),
        staff!bookings_staff_tenant_fkey(name),
        booking_payments(amount, status)
      `,
    )
    .eq("tenant_id", auth.tenantId)
    .gte("starts_at", dayRange.start)
    .lt("starts_at", dayRange.end)
    .in("status", ["pending", "confirmed", "completed"])
    .order("starts_at", { ascending: true })
    .limit(50);
  const posBookings = ((bookings ?? []) as PosBooking[]).filter((booking) => {
    if (!booking.services) {
      return false;
    }

    return getRemainingAmount({
      payments: booking.booking_payments ?? [],
      servicePrice: booking.services.price,
    }) > 0;
  });

  return (
    <section className="flex flex-col gap-6">
      <PosHeader />
      <PosBookingsList bookings={posBookings} timeZone={timeZone} />
    </section>
  );
}
