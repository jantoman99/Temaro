"use client";

import { useActionState, useMemo, useState } from "react";
import { Check, Clock3, Scissors } from "lucide-react";

import { createPublicBookingAction, joinWaitlistAction } from "@/app/(booking)/[slug]/actions";
import { Button } from "@/components/ui/button";
import { BOOKING_NOTE_MAX_LENGTH } from "@/lib/booking-form-limits";
import type { AvailabilitySlot } from "@/lib/booking/availability";
import {
  getAvailableBookingSlots,
  getAvailableBookingStaff,
  getSelectedBookingSlot,
  shouldShowStaffNameInSlots,
  type PublicBookingStaff,
} from "@/lib/booking/public-form-options";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { EMAIL_INPUT_MAX_LENGTH } from "@/lib/email-input";
import { PHONE_INPUT_MAX_LENGTH } from "@/lib/phone-ui";
import type { Database } from "@/types/database";
import type { BookingSourceTracking } from "@/lib/booking/source";

type Service = Database["public"]["Tables"]["services"]["Row"];

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "h-11 rounded-lg border border-input bg-card px-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15";
const textareaClassName =
  "rounded-lg border border-input bg-card px-3 py-2.5 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15";

function formatIcsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function getServiceDepositAmount(service: Service) {
  if (service.deposit_type === "fixed") return service.deposit_value;
  if (service.deposit_type === "percent") return Math.ceil((service.price * service.deposit_value) / 100);
  return 0;
}

function getServiceDepositLabel(service: Service) {
  const depositAmount = getServiceDepositAmount(service);

  if (depositAmount === 0) {
    return "Bez zálohy";
  }

  return `Záloha ${formatCurrencyForDisplay(depositAmount, service.currency)}`;
}

function BookingReceipt({
  clientEmail,
  clientName,
  manageUrl,
  selectedService,
  selectedSlot,
}: {
  clientEmail: string;
  clientName: string;
  manageUrl?: string | null;
  selectedService: Service | null;
  selectedSlot: AvailabilitySlot | null;
}) {
  const serviceName = selectedService?.name ?? "Vybraná služba";
  const depositAmount = selectedService ? getServiceDepositAmount(selectedService) : 0;
  const slotLabel = selectedSlot?.label ?? "Vybraný termín";
  const issuedAt = new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  const endsAt = selectedSlot
    ? new Date(new Date(selectedSlot.startsAt).getTime() + (selectedService?.duration_minutes ?? 30) * 60_000).toISOString()
    : "";
  const calendarHref = selectedSlot
    ? `data:text/calendar;charset=utf-8,${encodeURIComponent([
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Temaro//Booking//CS",
        "BEGIN:VEVENT",
        `UID:${selectedSlot.id}@temaro`,
        `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
        `DTSTART:${formatIcsDate(selectedSlot.startsAt)}`,
        `DTEND:${formatIcsDate(endsAt)}`,
        `SUMMARY:${serviceName}`,
        `DESCRIPTION:Rezervace čeká na potvrzení podniku.`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n"))}`
    : "#";

  return (
    <section className="booking-receipt w-full overflow-hidden rounded-xl border border-success/25 bg-card shadow-lg">
      <div className="relative p-6 text-left">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.64_0.145_151/0.16),transparent_42%)]" aria-hidden />
        <div className="relative">
          <div className="mx-auto grid size-14 place-items-center rounded-full border border-success/30 bg-success/10 text-success">
            <svg className="booking-check size-9" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M14 25.5 21.5 33 35 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
            </svg>
          </div>
          <h2 className="mt-5 text-center text-2xl font-semibold tracking-tight">Rezervace je odeslaná</h2>
          <p className="mt-2 text-center text-sm font-medium leading-6 text-muted-foreground">Podnik ji teď potvrdí a pošle vám e-mail.</p>
        </div>
      </div>
      <div className="booking-receipt-body border-t border-dashed border-border px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Účtenka rezervace</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">{serviceName}</p>
          </div>
          <p className="nums-tabular text-right text-xs font-semibold text-muted-foreground">{issuedAt}</p>
        </div>
        <dl className="mt-5 grid gap-3 text-sm">
          {[
            ["Termín", slotLabel],
            ["Cena", selectedService ? formatCurrencyForDisplay(selectedService.price, selectedService.currency) : "Dle služby"],
            [
              "Záloha",
              selectedService && depositAmount > 0
                ? `${formatCurrencyForDisplay(depositAmount, selectedService.currency)} · zatím se neplatí online`
                : "Není vyžadována",
            ],
            ["Klient", clientName || "Vyplněný kontakt"],
            ["E-mail", clientEmail || "E-mail nebyl vyplněn"],
            ["Stav", "Čeká na potvrzení podniku"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 border-b border-border/70 pb-2 last:border-b-0 last:pb-0">
              <dt className="font-medium text-muted-foreground">{label}</dt>
              <dd className="text-right font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="booking-receipt-actions mt-5 grid gap-2 sm:grid-cols-2">
          <a className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground" download="rezervace.ics" href={calendarHref}>
            Přidat do kalendáře
          </a>
          <a className={`inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-semibold ${manageUrl ? "" : "pointer-events-none opacity-55"}`} href={manageUrl ?? "#"}>
            {manageUrl ? "Spravovat rezervaci" : "Odkaz přijde e-mailem"}
          </a>
        </div>
      </div>
    </section>
  );
}

export function PublicBookingForm({
  availabilitySlots,
  loadError = false,
  services,
  slug,
  sourceTracking,
  staff,
}: {
  availabilitySlots: AvailabilitySlot[];
  loadError?: boolean;
  services: Service[];
  slug: string;
  sourceTracking?: BookingSourceTracking;
  staff: PublicBookingStaff[];
}) {
  const [state, formAction, isPending] = useActionState(createPublicBookingAction, initialState);
  const [waitlistState, waitlistFormAction, isWaitlistPending] = useActionState(joinWaitlistAction, initialState);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "");
  const [selectedStaffId, setSelectedStaffId] = useState("any");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const availableStaff = useMemo(() => {
    return getAvailableBookingStaff({ selectedServiceId, staff });
  }, [selectedServiceId, staff]);

  const availableSlots = useMemo(() => {
    return getAvailableBookingSlots({
      availabilitySlots,
      selectedServiceId,
      selectedStaffId,
    });
  }, [availabilitySlots, selectedServiceId, selectedStaffId]);

  const selectedSlot = getSelectedBookingSlot({ availableSlots, selectedSlotId });
  const showStaffNameInSlots = shouldShowStaffNameInSlots({
    availableStaffCount: availableStaff.length,
    selectedStaffId,
  });
  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0] ?? null;
  const selectedDepositAmount = selectedService ? getServiceDepositAmount(selectedService) : 0;
  const progressSteps = [
    { done: Boolean(selectedService), label: "Služba" },
    { done: Boolean(selectedSlot), label: "Termín" },
    { done: false, label: "Kontakt" },
  ];

  if (state.success) {
    return (
      <BookingReceipt
        clientEmail={clientEmail}
        clientName={clientName}
        manageUrl={null}
        selectedService={selectedService}
        selectedSlot={selectedSlot}
      />
    );
  }

  return (
    <form action={formAction} className="w-full rounded-xl border border-border bg-card/96 p-5 shadow-[var(--shadow-command)] backdrop-blur sm:p-6">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="serviceId" value={selectedServiceId} />
      <input type="hidden" name="staffId" value={selectedSlot?.staffId ?? (selectedStaffId === "any" ? "" : selectedStaffId)} />
      <input type="hidden" name="startsAt" value={selectedSlot?.startsAt ?? ""} />
      <input type="hidden" name="source" value={sourceTracking?.source ?? "online"} />
      <input type="hidden" name="sourceDetail" value={sourceTracking?.sourceDetail ?? ""} />
      <input type="hidden" name="utmSource" value={sourceTracking?.metadata.utm_source ?? ""} />
      <input type="hidden" name="utmMedium" value={sourceTracking?.metadata.utm_medium ?? ""} />
      <input type="hidden" name="utmCampaign" value={sourceTracking?.metadata.utm_campaign ?? ""} />
      <input type="hidden" name="utmTerm" value={sourceTracking?.metadata.utm_term ?? ""} />
      <input type="hidden" name="utmContent" value={sourceTracking?.metadata.utm_content ?? ""} />
      <input type="hidden" name="ref" value={sourceTracking?.metadata.ref ?? ""} />
      <header className="mb-7 rounded-2xl border border-border bg-secondary/75 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Online rezervace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Vyberte službu, termín a kontakt.</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {progressSteps.map((step, index) => (
            <div key={step.label} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <span
                  className={`grid size-7 place-items-center rounded-lg text-xs font-black ${
                    step.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-foreground">{step.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2 rounded-xl border border-border bg-card p-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vybraná služba</p>
            <p className="mt-1 truncate text-sm font-semibold text-foreground">
              {selectedService?.name ?? "Zatím nevybráno"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vybraný termín</p>
            <p className="nums-tabular mt-1 truncate text-sm font-semibold text-foreground">
              {selectedSlot?.label ?? "Vyberte volné okno"}
            </p>
          </div>
        </div>
      </header>
      <div className="grid gap-8">
        <section>
          <div className="mb-4 flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
              1
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Vyberte službu</h2>
          </div>
          <div className="space-y-2">
            {services.map((service, index) => {
              const isSelected = service.id === selectedServiceId;
              const tagClassNames = ["bg-primary/10 text-primary", "bg-info/10 text-info", "bg-muted text-muted-foreground"];

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setSelectedServiceId(service.id);
                    setSelectedStaffId("any");
                    setSelectedSlotId("");
                  }}
                    className={`flex w-full items-center gap-4 rounded-xl bg-card p-4 text-left transition hover:border-primary/30 ${
                    isSelected
                      ? "border-2 border-primary shadow-md shadow-primary/10"
                      : "border border-border"
                  }`}
                >
                  <div className={`grid size-10 place-items-center rounded-xl ${tagClassNames[index % tagClassNames.length]}`}>
                    <Scissors className="size-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{service.name}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Clock3 className="size-3 stroke-[1.75]" />
                      {service.duration_minutes} min
                    </div>
                  </div>
                  <div className="nums-tabular text-right font-semibold text-foreground">
                    {formatCurrencyForDisplay(service.price, service.currency)}
                    {getServiceDepositAmount(service) > 0 ? (
                      <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                        {getServiceDepositLabel(service)}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
              2
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Vyberte poskytovatele a termín</h2>
          </div>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                setSelectedStaffId("any");
                setSelectedSlotId("");
              }}
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                selectedStaffId === "any"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              Komukoliv
            </button>
            {availableStaff.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => {
                  setSelectedStaffId(member.id);
                  setSelectedSlotId("");
                }}
                className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  selectedStaffId === member.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {member.name}
              </button>
            ))}
          </div>
          {availableSlots.length > 0 ? (
            <div className="nums-tabular grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-border bg-secondary p-2 sm:grid-cols-3">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;

                return (
                  <button
                  key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/15"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                >
                    <span className="block">{slot.label}</span>
                  {showStaffNameInSlots ? (
                      <span className={isSelected ? "block text-xs opacity-80" : "block text-xs font-medium text-muted-foreground"}>
                        {availableStaff.find((member) => member.id === slot.staffId)?.name}
                      </span>
                  ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm font-medium text-amber-900">
              <p>Pro tuto kombinaci zatím nejsou volné termíny.</p>
              <p className="mt-1 text-xs font-semibold text-amber-800">
                Vyplňte kontakt níže a přidejte se na čekací listinu.
              </p>
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
              3
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Vaše údaje</h2>
          </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="clientName">
              Jméno
            </label>
            <input
              id="clientName"
              name="clientName"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
                className={inputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="clientPhone">
              Telefon
            </label>
            <input
              id="clientPhone"
              name="clientPhone"
              type="tel"
              autoComplete="tel"
              maxLength={PHONE_INPUT_MAX_LENGTH}
                className={inputClassName}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="clientEmail">
            Email
          </label>
          <input
            id="clientEmail"
            name="clientEmail"
            type="email"
            autoComplete="email"
            maxLength={EMAIL_INPUT_MAX_LENGTH}
            value={clientEmail}
            onChange={(event) => setClientEmail(event.target.value)}
              className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="notes">
            Poznámka k rezervaci
          </label>
          <textarea
            id="notes"
            name="notes"
            maxLength={BOOKING_NOTE_MAX_LENGTH}
            rows={3}
              className={textareaClassName}
          />
        </div>
        </section>
      </div>
      {state.error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {state.success}
        </p>
      ) : null}
      {waitlistState.error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {waitlistState.error}
        </p>
      ) : null}
      {waitlistState.success ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {waitlistState.success}
        </p>
      ) : null}
      {loadError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          Dostupné termíny se teď nepodařilo načíst. Zkuste stránku obnovit později.
        </p>
      ) : null}
      <section className="mt-5 rounded-2xl bg-primary p-5 text-primary-foreground shadow-[var(--shadow-primary-glow)]">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary-foreground/75">
          <Check className="size-4 stroke-[1.75]" />
          Shrnutí rezervace
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="font-semibold">{selectedService?.name ?? "Vyberte službu"}</div>
            <div className="nums-tabular text-sm font-medium text-primary-foreground/70">{selectedSlot?.label ?? "Vyberte termín"}</div>
            {selectedService && selectedDepositAmount > 0 ? (
              <div className="nums-tabular mt-1 text-sm font-semibold text-primary-foreground/85">
                Požadovaná záloha {formatCurrencyForDisplay(selectedDepositAmount, selectedService.currency)}
              </div>
            ) : null}
          </div>
          <div className="nums-tabular text-right text-xl font-semibold">
            {selectedService
              ? formatCurrencyForDisplay(selectedService.price, selectedService.currency)
              : ""}
          </div>
        </div>
      </section>
      <Button
        type="submit"
        size="xl"
        disabled={
          Boolean(state.success) ||
          loadError ||
          isPending ||
          services.length === 0 ||
          availableStaff.length === 0 ||
          !selectedSlot
        }
        className="mt-3 w-full"
      >
        {isPending ? "Odesílám..." : "Potvrdit rezervaci"}
      </Button>
      {!loadError && (services.length === 0 || availableStaff.length === 0 || !selectedSlot) ? (
        <div className="mt-3 grid gap-2">
          <Button
            type="submit"
            formAction={waitlistFormAction}
            variant="outline"
            disabled={
              Boolean(waitlistState.success) ||
              loadError ||
              isWaitlistPending ||
              services.length === 0 ||
              availableStaff.length === 0 ||
              !selectedService
            }
            className="w-full"
          >
            {isWaitlistPending ? "Zapisuji..." : "Přidat na čekací listinu"}
          </Button>
          <p className="text-xs font-medium text-muted-foreground">
            Tento podnik zatím nemá dostupné termíny pro online rezervaci.
          </p>
        </div>
      ) : null}
    </form>
  );
}
