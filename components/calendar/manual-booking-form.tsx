"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createManualBookingAction } from "@/app/(dashboard)/calendar/actions";
import { Button } from "@/components/ui/button";
import { BOOKING_NOTE_MAX_LENGTH } from "@/lib/booking-form-limits";
import {
  getAvailableServicesForStaff,
  getSafeInitialId,
  getSafeSelectedServiceId,
} from "@/lib/calendar/manual-booking";
import { EMAIL_INPUT_MAX_LENGTH } from "@/lib/email-input";
import { PHONE_INPUT_MAX_LENGTH } from "@/lib/phone-ui";
import { utcIsoToLocalDatetimeValue } from "@/lib/time-zone";
import type { Database } from "@/types/database";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];
type Staff = Database["public"]["Tables"]["staff"]["Row"] & {
  staff_services: Database["public"]["Tables"]["staff_services"]["Row"][];
};

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "h-12 rounded-md border border-border bg-card px-4 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const textareaClassName =
  "rounded-md border border-border bg-card px-4 py-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClassName = "text-sm font-medium text-foreground";

function toDatetimeLocalValue(value: Date | string, timeZone: string) {
  const rawValue = typeof value === "string" ? value : value.toISOString();

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(rawValue)) {
    return rawValue;
  }

  return utcIsoToLocalDatetimeValue(rawValue, timeZone);
}

export function ManualBookingForm({
  clients,
  initialClientId,
  initialStartsAt,
  initialStaffId,
  returnTo,
  services,
  staff,
  timeZone = "Europe/Prague",
}: {
  clients: Client[];
  initialClientId?: string;
  initialStartsAt?: string;
  initialStaffId?: string;
  services: Service[];
  staff: Staff[];
  returnTo?: string;
  timeZone?: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createManualBookingAction, initialState);
  const clientIds = clients.map((client) => client.id);
  const staffIds = staff.map((member) => member.id);
  const hasInitialClientSelection = Boolean(initialClientId && clientIds.includes(initialClientId));
  const hasInitialStaffSelection = Boolean(initialStaffId && staffIds.includes(initialStaffId));
  const [selectedClientId, setSelectedClientId] = useState(
    getSafeInitialId(clientIds, initialClientId, ""),
  );
  const [selectedStaffId, setSelectedStaffId] = useState(
    getSafeInitialId(staffIds, initialStaffId, staff[0]?.id ?? ""),
  );
  const [defaultStart] = useState(() =>
    initialStartsAt
      ? toDatetimeLocalValue(initialStartsAt, timeZone)
      : toDatetimeLocalValue(new Date(Date.now() + 60 * 60 * 1000), timeZone),
  );

  const availableServices = useMemo(() => {
    return getAvailableServicesForStaff(services, staff, selectedStaffId);
  }, [selectedStaffId, services, staff]);
  const [selectedServiceId, setSelectedServiceId] = useState(() =>
    getSafeSelectedServiceId(availableServices),
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="rounded-lg border border-border bg-card p-5 shadow-sm">
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Rychlé vytvoření</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Nová rezervace</h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">Pro ruční termíny, walk-in klienty a telefonické objednávky.</p>
      </div>
      <div className="grid gap-4">
        <div className="flex flex-col gap-2">
          <label className={labelClassName} htmlFor="clientId">
            Klient
          </label>
          <select
            id="clientId"
            name="clientId"
            value={selectedClientId}
            onChange={(event) => setSelectedClientId(event.target.value)}
            className={inputClassName}
          >
            <option value="">Walk-in / bez klienta</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name}
              </option>
            ))}
          </select>
        </div>
        {initialClientId ? (
          hasInitialClientSelection ? (
            <p className="rounded-md border border-border bg-background px-4 py-3 text-sm font-medium text-muted-foreground">
              Klient je předvybraný z detailu profilu. Když chceš, můžeš ho tady změnit.
            </p>
          ) : (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
              Původně předvybraný klient už není dostupný. Vyber jiného nebo vytvoř nového.
            </p>
          )
        ) : null}
        {initialStartsAt ? (
          <p className="rounded-md border border-border bg-background px-4 py-3 text-sm font-medium text-muted-foreground">
            Čas je předvybraný z kalendáře. Když chceš, můžeš ho upravit.
          </p>
        ) : null}
        {initialStaffId ? (
          hasInitialStaffSelection ? (
            <p className="rounded-md border border-border bg-background px-4 py-3 text-sm font-medium text-muted-foreground">
              Zaměstnanec je předvybraný. Když chceš, můžeš ho tady změnit.
            </p>
          ) : (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
              Původně předvybraný zaměstnanec už není dostupný. Vyber prosím jiného.
            </p>
          )
        ) : null}
        {selectedClientId ? (
          <p className="rounded-md border border-border bg-background px-4 py-3 text-sm font-medium text-muted-foreground">
            Je vybraný existující klient. Pole pro nového klienta se teď nepoužijí.
          </p>
        ) : (
          <div className="grid gap-4 rounded-lg border border-border bg-background p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-foreground">Nový klient</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Když klient ještě není v seznamu, můžeš ho vytvořit rovnou tady.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClassName} htmlFor="clientFullName">
                Jméno nového klienta
              </label>
              <input
                id="clientFullName"
                name="clientFullName"
                minLength={2}
                maxLength={100}
                autoComplete="name"
                placeholder="Petr Svoboda"
                className={inputClassName}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className={labelClassName} htmlFor="clientPhone">
                  Telefon
                </label>
                <input
                  id="clientPhone"
                  name="clientPhone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={PHONE_INPUT_MAX_LENGTH}
                  placeholder="+420 777 123 456"
                  className={inputClassName}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className={labelClassName} htmlFor="clientEmail">
                  Email
                </label>
                <input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  autoComplete="email"
                  maxLength={EMAIL_INPUT_MAX_LENGTH}
                  placeholder="petr@example.com"
                  className={inputClassName}
                />
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label className={labelClassName} htmlFor="staffId">
            Zaměstnanec
          </label>
          <select
            id="staffId"
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
            className={inputClassName}
          >
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelClassName} htmlFor="serviceId">
            Služba
          </label>
          <select
            id="serviceId"
            name="serviceId"
            required
            value={selectedServiceId}
            onChange={(event) => setSelectedServiceId(event.target.value)}
            className={inputClassName}
          >
            {availableServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelClassName} htmlFor="startsAt">
            Začátek
          </label>
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={defaultStart}
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelClassName} htmlFor="notes">
            Poznámka
          </label>
          <textarea
            id="notes"
            name="notes"
            maxLength={BOOKING_NOTE_MAX_LENGTH}
            rows={3}
            className={textareaClassName}
          />
        </div>
        <label className="flex items-start gap-3 rounded-md border border-border bg-background px-4 py-3 text-sm shadow-sm">
          <input
            name="sendNotification"
            type="checkbox"
            defaultChecked
            className="mt-0.5 size-4 rounded border border-border"
          />
          <span>
            Poslat klientovi potvrzovací email
            <span className="mt-1 block text-muted-foreground">
              Hodí se pro běžnou rezervaci. Když klient stojí u vás osobně, můžeš to vypnout.
            </span>
          </span>
        </label>
      </div>
      {state.error ? (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={isPending || staff.length === 0 || availableServices.length === 0} className="mt-5 h-12 w-full">
        {isPending ? "Ukládám..." : "Vytvořit rezervaci"}
      </Button>
      {staff.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Nejdřív vytvořte zaměstnance a přiřaďte mu alespoň jednu službu.
        </p>
      ) : null}
      {staff.length > 0 && availableServices.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Vybraný zaměstnanec teď nemá žádnou dostupnou službu. Vyberte jiného nebo mu službu znovu přiřaďte.
        </p>
      ) : null}
    </form>
  );
}
