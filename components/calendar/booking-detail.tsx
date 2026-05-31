"use client";

import Link from "next/link";
import { type FormEvent, useActionState, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { recordBookingPaymentAction, updateBookingAction } from "@/app/(dashboard)/calendar/actions";
import { BookingStatusActionForm } from "@/components/calendar/booking-status-action-form";
import { getBookingStatusClassName, getBookingStatusLabel } from "@/components/calendar/booking-status";
import { BOOKING_NOTE_MAX_LENGTH } from "@/lib/booking-form-limits";
import { getBookingSourceDescription } from "@/lib/booking/source";
import {
  getAvailableServicesForStaff,
  getSafeInitialId,
  getSafeSelectedServiceId,
} from "@/lib/calendar/manual-booking";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { formatDateTimeForDisplay } from "@/lib/date-format";
import { utcIsoToLocalDatetimeValue } from "@/lib/time-zone";
import type { Database } from "@/types/database";

type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  clients:
    | Pick<Database["public"]["Tables"]["clients"]["Row"], "full_name">
    | Pick<
        Database["public"]["Tables"]["clients"]["Row"],
        "email" | "flag_reason" | "full_name" | "is_flagged" | "no_show_count" | "phone"
      >
    | null;
  services:
    | Pick<Database["public"]["Tables"]["services"]["Row"], "name">
    | Pick<Database["public"]["Tables"]["services"]["Row"], "duration_minutes" | "name" | "price" | "currency">
    | null;
  staff: Pick<Database["public"]["Tables"]["staff"]["Row"], "name" | "color"> | null;
};
type Service = Pick<Database["public"]["Tables"]["services"]["Row"], "id" | "name">;
type Staff = Pick<Database["public"]["Tables"]["staff"]["Row"], "id" | "name"> & {
  staff_services: Pick<Database["public"]["Tables"]["staff_services"]["Row"], "service_id">[];
};
type BookingEvent = Pick<
  Database["public"]["Tables"]["booking_events"]["Row"],
  "actor_type" | "created_at" | "event_type" | "id" | "metadata"
> & {
  users: Pick<Database["public"]["Tables"]["users"]["Row"], "email" | "full_name"> | null;
};
type BookingPayment = Pick<
  Database["public"]["Tables"]["booking_payments"]["Row"],
  "amount" | "created_at" | "currency" | "id" | "method" | "note" | "paid_at" | "payment_scope" | "refunded_at" | "status"
>;

const initialState = {
  error: "",
  success: "",
};

const paymentInitialState: { error?: string; success?: string } = {
  error: "",
  success: "",
};

function formatDateTime(value: string, timeZone: string) {
  return formatDateTimeForDisplay(value, timeZone);
}

function getClientPhone(client: Booking["clients"]) {
  return client && "phone" in client ? client.phone : null;
}

function getClientEmail(client: Booking["clients"]) {
  return client && "email" in client ? client.email : null;
}

function isFlaggedClient(client: Booking["clients"]) {
  return Boolean(client && "is_flagged" in client && client.is_flagged);
}

function getClientFlagReason(client: Booking["clients"]) {
  return client && "flag_reason" in client ? client.flag_reason : null;
}

function getClientNoShowCount(client: Booking["clients"]) {
  return client && "no_show_count" in client ? client.no_show_count : 0;
}

function getServiceMeta(service: Booking["services"]) {
  if (!service || !("duration_minutes" in service)) {
    return null;
  }

  return `${service.duration_minutes} min · ${formatCurrencyForDisplay(service.price, service.currency, 2)}`;
}

function getBookingCurrency(booking: Booking) {
  if (booking.services && "currency" in booking.services) {
    return booking.services.currency;
  }

  return "CZK";
}

function getEventLabel(eventType: BookingEvent["event_type"]) {
  const labels: Record<BookingEvent["event_type"], string> = {
    cancelled: "Rezervace zrušena",
    completed: "Rezervace dokončena",
    confirmed: "Rezervace potvrzena",
    created: "Rezervace vytvořena",
    no_show: "Klient nedorazil",
    payment_recorded: "Platba zaevidována",
    rejected: "Rezervace odmítnuta",
    rescheduled: "Rezervace přesunuta",
  };

  return labels[eventType];
}

function getActorLabel(event: BookingEvent) {
  if (event.actor_type === "client") {
    return "Klient";
  }

  if (event.actor_type === "system") {
    return "Systém";
  }

  return event.users?.full_name ?? event.users?.email ?? "Provozovatel";
}

function getPaymentScopeLabel(scope: BookingPayment["payment_scope"]) {
  const labels: Record<BookingPayment["payment_scope"], string> = {
    deposit: "Záloha",
    full: "Celá platba",
    other: "Jiné",
    remaining: "Doplatek",
  };

  return labels[scope];
}

function getPaymentMethodLabel(method: BookingPayment["method"]) {
  const labels: Record<BookingPayment["method"], string> = {
    bank_transfer: "Bankovní převod",
    card_terminal: "Karta na místě",
    cash: "Hotově",
    online_card: "Online karta",
    other: "Jiné",
    voucher: "Voucher",
  };

  return labels[method];
}

function getPaidPaymentsTotal(payments: BookingPayment[]) {
  return payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function BookingDetail({
  booking,
  bookingEvents = [],
  bookingPayments = [],
  canManageBookings = true,
  services = [],
  staff = [],
  timeZone = "Europe/Prague",
}: {
  booking: Booking | null;
  bookingEvents?: BookingEvent[];
  bookingPayments?: BookingPayment[];
  canManageBookings?: boolean;
  closeHref?: string;
  services?: Service[];
  staff?: Staff[];
  timeZone?: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateBookingAction, initialState);
  const [paymentState, setPaymentState] = useState(paymentInitialState);
  const [isPaymentPending, startPaymentTransition] = useTransition();
  const staffIds = staff.map((member) => member.id);
  const serviceIds = services.map((service) => service.id);
  const [selectedStaffId, setSelectedStaffId] = useState(
    getSafeInitialId(staffIds, booking?.staff_id, staff[0]?.id ?? ""),
  );
  const availableServices = useMemo(
    () => getAvailableServicesForStaff(services, staff, selectedStaffId),
    [selectedStaffId, services, staff],
  );
  const [selectedServiceId, setSelectedServiceId] = useState(() =>
    getSafeSelectedServiceId(availableServices, booking?.service_id),
  );

  if (!booking) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm font-medium text-muted-foreground shadow-sm">
        <p className="text-base font-semibold text-foreground">Vyber rezervaci</p>
        <p className="mt-2">Klikni na rezervaci v kalendáři nebo v seznamu. Tady se zobrazí její detail.</p>
      </section>
    );
  }

  const hasInitialStaffSelection = staffIds.includes(booking.staff_id);
  const hasInitialServiceSelection = serviceIds.includes(booking.service_id);
  const bookingCurrency = getBookingCurrency(booking);
  const paidTotal = getPaidPaymentsTotal(bookingPayments);

  function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startPaymentTransition(async () => {
      const nextState = await recordBookingPaymentAction(paymentInitialState, formData);
      setPaymentState(nextState);

      if (nextState.success) {
        form.reset();
        router.refresh();
      }
    });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 pt-2 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{booking.services?.name ?? "Rezervace"}</h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          {formatDateTime(booking.starts_at, timeZone)}
        </p>
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <div className="rounded-lg border border-border bg-background p-3 shadow-sm">
          <dt className="text-xs text-muted-foreground">Kdy</dt>
          <dd className="mt-1 font-medium">{formatDateTime(booking.starts_at, timeZone)}</dd>
        </div>
        <div className="rounded-lg border border-border bg-background p-3 shadow-sm">
          <dt className="text-xs text-muted-foreground">Klient</dt>
          <dd className="mt-1 font-medium">
            {booking.client_id ? (
              canManageBookings ? (
                <Link href={`/clients/${booking.client_id}`} className="hover:underline">
                  {booking.clients?.full_name ?? "Klient"}
                </Link>
              ) : (
                (booking.clients?.full_name ?? "Klient")
              )
            ) : (
              "Walk-in"
            )}
          </dd>
          {getClientPhone(booking.clients) ? <dd className="mt-1 text-muted-foreground">{getClientPhone(booking.clients)}</dd> : null}
          {getClientEmail(booking.clients) ? <dd className="mt-1 text-muted-foreground">{getClientEmail(booking.clients)}</dd> : null}
          {isFlaggedClient(booking.clients) ? (
            <dd className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-amber-800">
              Pozor, klient je označený.
              {getClientFlagReason(booking.clients) ? ` ${getClientFlagReason(booking.clients)}` : ""}
              {getClientNoShowCount(booking.clients) > 0 ? ` No-show: ${getClientNoShowCount(booking.clients)}.` : ""}
            </dd>
          ) : null}
        </div>
        <div className="rounded-lg border border-border bg-background p-3 shadow-sm">
          <dt className="text-xs text-muted-foreground">Zaměstnanec</dt>
          <dd className="mt-1 flex items-center gap-2 font-medium">
            <span
              className="size-3 rounded-full border border-border"
              style={{ backgroundColor: booking.staff?.color ?? "oklch(0.62 0.18 275)" }}
            />
            {booking.staff?.name ?? "Zaměstnanec"}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-background p-3 shadow-sm">
          <dt className="text-xs text-muted-foreground">Stav</dt>
          <dd className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getBookingStatusClassName(booking.status)}`}>
            {getBookingStatusLabel(booking.status)}
          </dd>
          <dd className="mt-1 text-muted-foreground">
            {getBookingSourceDescription({ source: booking.source, sourceDetail: booking.source_detail })}
          </dd>
        </div>
        {getServiceMeta(booking.services) ? (
          <div className="rounded-xl border border-border bg-background p-3">
            <dt className="text-xs text-muted-foreground">Služba</dt>
            <dd className="mt-1 font-medium">{getServiceMeta(booking.services)}</dd>
          </div>
        ) : null}
        {booking.deposit_amount > 0 ? (
          <div className="rounded-xl border border-border bg-background p-3">
            <dt className="text-xs text-muted-foreground">Záloha</dt>
            <dd className="mt-1 font-medium">
              {formatCurrencyForDisplay(booking.deposit_amount, getBookingCurrency(booking), 2)}
            </dd>
            <dd className="mt-1 text-muted-foreground">
              {booking.deposit_paid
                ? `Zaplaceno${booking.deposit_paid_at ? ` · ${formatDateTime(booking.deposit_paid_at, timeZone)}` : ""}`
                : "Čeká na platbu nebo doplatek u podniku"}
            </dd>
          </div>
        ) : null}
        <div className="rounded-xl border border-border bg-background p-3">
          <dt className="text-xs text-muted-foreground">Platby</dt>
          <dd className="mt-1 font-medium">
            {formatCurrencyForDisplay(paidTotal, bookingCurrency, 2)} zaevidováno
          </dd>
          <dd className="mt-1 text-muted-foreground">
            {booking.services && "price" in booking.services
              ? `Cena služby ${formatCurrencyForDisplay(booking.services.price, bookingCurrency, 2)}`
              : "Cena služby není dostupná"}
          </dd>
        </div>
        {booking.notes ? (
          <div className="rounded-xl border border-border bg-background p-3">
            <dt className="text-xs text-muted-foreground">Poznámka</dt>
            <dd className="mt-1 whitespace-pre-wrap">{booking.notes}</dd>
          </div>
        ) : null}
        {booking.cancellation_reason ? (
          <div className="rounded-xl border border-border bg-background p-3">
            <dt className="text-xs text-muted-foreground">Důvod zrušení</dt>
            <dd className="mt-1 whitespace-pre-wrap">{booking.cancellation_reason}</dd>
          </div>
        ) : null}
      </dl>

      {canManageBookings && (booking.status === "pending" || booking.status === "confirmed") ? (
        <div className="mt-5 grid gap-2">
          {booking.status === "pending" ? (
            <BookingStatusActionForm
              action="confirm"
              bookingId={booking.id}
              buttonClassName="w-full border-primary bg-primary text-primary-foreground"
              label="Potvrdit rezervaci"
              pendingLabel="Potvrzuji..."
            />
          ) : (
            <BookingStatusActionForm
              action="complete"
              bookingId={booking.id}
              buttonClassName="w-full border-primary bg-primary text-primary-foreground"
              label="Dokončit"
              pendingLabel="Dokončuji..."
            />
          )}
          <div className="grid grid-cols-2 gap-2">
            {booking.status === "confirmed" ? (
              <BookingStatusActionForm
                action="noShow"
                bookingId={booking.id}
                buttonClassName="w-full border-border"
                label="No-show"
                pendingLabel="Ukládám..."
              />
            ) : (
              <div />
            )}
            {booking.status === "confirmed" ? (
              <BookingStatusActionForm
                action="cancel"
                bookingId={booking.id}
                buttonClassName="w-full border-destructive/30 text-destructive"
                label="Zrušit"
                pendingLabel="Ruším..."
              />
            ) : (
              <div />
            )}
          </div>
        </div>
      ) : null}

      {canManageBookings ? (
        <div className="mt-5 rounded-lg border border-border bg-background p-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Evidence platby</p>
          <form onSubmit={handlePaymentSubmit} className="mt-3 grid gap-3">
            <input type="hidden" name="bookingId" value={booking.id} />
            <input type="hidden" name="currency" value={bookingCurrency} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-xs text-muted-foreground">Typ platby</span>
                <select
                  name="paymentScope"
                  defaultValue={booking.deposit_amount > 0 && !booking.deposit_paid ? "deposit" : "remaining"}
                  className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none ring-ring/40 focus:ring-3"
                >
                  <option value="deposit">Záloha</option>
                  <option value="remaining">Doplatek</option>
                  <option value="full">Celá platba</option>
                  <option value="other">Jiné</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-xs text-muted-foreground">Metoda</span>
                <select
                  name="method"
                  defaultValue="cash"
                  className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none ring-ring/40 focus:ring-3"
                >
                  <option value="cash">Hotově</option>
                  <option value="card_terminal">Karta na místě</option>
                  <option value="bank_transfer">Bankovní převod</option>
                  <option value="online_card">Online karta</option>
                  <option value="voucher">Voucher</option>
                  <option value="other">Jiné</option>
                </select>
              </label>
            </div>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Částka</span>
              <input
                name="amount"
                inputMode="decimal"
                required
                defaultValue={booking.deposit_amount > 0 && !booking.deposit_paid ? (booking.deposit_amount / 100).toFixed(2).replace(".", ",") : ""}
                placeholder="100"
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none ring-ring/40 focus:ring-3"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Poznámka</span>
              <textarea
                name="note"
                maxLength={500}
                rows={2}
                placeholder="Například: zaplaceno hotově při příchodu."
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-3"
              />
            </label>
            {paymentState.error ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {paymentState.error}
              </p>
            ) : null}
            {paymentState.success ? (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                {paymentState.success}
              </p>
            ) : null}
            <button
              disabled={isPaymentPending}
              className="h-10 w-full rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {isPaymentPending ? "Ukládám..." : "Zaevidovat platbu"}
            </button>
          </form>

          <div className="mt-4 grid gap-2">
            {bookingPayments.length > 0 ? (
              bookingPayments.map((payment) => (
                <div key={payment.id} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {getPaymentScopeLabel(payment.payment_scope)} · {getPaymentMethodLabel(payment.method)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(payment.paid_at ?? payment.created_at, timeZone)}
                      </p>
                    </div>
                    <p className="nums-tabular font-semibold">
                      {formatCurrencyForDisplay(payment.amount, payment.currency, 2)}
                    </p>
                  </div>
                  {payment.note ? <p className="mt-2 text-xs text-muted-foreground">{payment.note}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-sm font-medium text-muted-foreground">Zatím není zaevidovaná žádná platba.</p>
            )}
          </div>
        </div>
      ) : null}

      {canManageBookings && booking.status === "pending" ? (
        <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Odmítnout rezervaci</p>
          <BookingStatusActionForm
            action="cancel"
            bookingId={booking.id}
            buttonClassName="mt-3 w-full border-destructive/30 text-destructive"
            cancellationReason
            className="mt-3"
            label="Odmítnout rezervaci"
            pendingLabel="Odmítám..."
            textareaPlaceholder="Například: vybraný termín už není k dispozici, prosíme o nový výběr."
          />
        </div>
      ) : null}

      {canManageBookings && (booking.status === "pending" || booking.status === "confirmed") ? (
        <form action={formAction} className="mt-5 rounded-lg border border-border bg-background p-3 shadow-sm">
          <input type="hidden" name="bookingId" value={booking.id} />
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Upravit rezervaci</p>
          {!hasInitialStaffSelection ? (
            <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
              Původně vybraný zaměstnanec už není dostupný. Vyberte prosím jiného.
            </p>
          ) : null}
          {!hasInitialServiceSelection ? (
            <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
              Původně vybraná služba už není dostupná. Vyberte prosím jinou.
            </p>
          ) : null}
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Čas</span>
              <input
                name="startsAt"
                type="datetime-local"
                required
                defaultValue={utcIsoToLocalDatetimeValue(booking.starts_at, timeZone)}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none ring-ring/40 focus:ring-3"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Zaměstnanec</span>
              <select
                name="staffId"
                required
                value={selectedStaffId}
                onChange={(event) => {
                  const nextStaffId = event.target.value;
                  const nextAvailableServices = getAvailableServicesForStaff(services, staff, nextStaffId);

                  setSelectedStaffId(nextStaffId);
                  setSelectedServiceId((currentValue) =>
                    getSafeSelectedServiceId(nextAvailableServices, currentValue),
                  );
                }}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none ring-ring/40 focus:ring-3"
              >
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Služba</span>
              <select
                name="serviceId"
                required
                value={selectedServiceId}
                onChange={(event) => setSelectedServiceId(event.target.value)}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none ring-ring/40 focus:ring-3"
              >
                {availableServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Poznámka</span>
              <textarea
                name="notes"
                maxLength={BOOKING_NOTE_MAX_LENGTH}
                rows={3}
                defaultValue={booking.notes ?? ""}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-3"
              />
            </label>
          </div>
          {state.error ? (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
              {state.success}
            </p>
          ) : null}
          <button
            disabled={isPending || availableServices.length === 0 || staff.length === 0}
            className="mt-3 h-10 w-full rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {isPending ? "Ukládám..." : "Uložit změny"}
          </button>
          {staff.length > 0 && availableServices.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Vybraný zaměstnanec teď nemá žádnou dostupnou službu. Vyberte jiného nebo mu službu znovu přiřaďte.
            </p>
          ) : null}
        </form>
      ) : null}

      <div className="mt-5 rounded-lg border border-border bg-background p-3 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Historie změn</p>
        <div className="mt-3 grid gap-3">
          {bookingEvents.length > 0 ? (
            bookingEvents.map((event) => (
              <div key={event.id} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <p className="font-medium">{getEventLabel(event.event_type)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(event.created_at, timeZone)} · {getActorLabel(event)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm font-medium text-muted-foreground">Zatím tu není žádná historie změn.</p>
          )}
        </div>
      </div>
    </section>
  );
}
