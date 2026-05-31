"use client";

import { useActionState } from "react";

import { createLastMinuteOfferAction, createMarketingCampaignAction } from "@/app/(dashboard)/campaigns/actions";
import { Button } from "@/components/ui/button";

type ServiceOption = { id: string; name: string };
type StaffOption = { id: string; name: string };

function ActionMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) {
    return null;
  }

  return (
    <p className={error ? "text-sm font-semibold text-destructive" : "text-sm font-semibold text-success"}>
      {error ?? success}
    </p>
  );
}

export function MarketingCampaignForm() {
  const [state, action, pending] = useActionState(createMarketingCampaignAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Nová kampaň</p>
        <p className="mt-1 text-sm text-muted-foreground">Draft pro e-mail/SMS blast. Odesílání přijde po produkčním providerovi.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Název
        <input name="name" required maxLength={120} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Kanál
          <select name="channel" defaultValue="email" className="rounded-md border border-input bg-background px-3 py-2">
            <option value="email">E-mail</option>
            <option value="sms">SMS</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Segment
          <select name="segment" defaultValue="all" className="rounded-md border border-input bg-background px-3 py-2">
            <option value="all">Všichni klienti</option>
            <option value="inactive_60d">Neaktivní 60 dní</option>
            <option value="flagged">Flagovaní klienti</option>
            <option value="no_show_risk">No-show riziko</option>
            <option value="last_visit_30d">Návštěva do 30 dní</option>
          </select>
        </label>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Předmět
        <input name="subject" maxLength={120} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Zpráva
        <textarea name="message" required rows={5} maxLength={1000} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending}>
        {pending ? "Ukládám..." : "Uložit kampaň"}
      </Button>
    </form>
  );
}

export function LastMinuteOfferForm({ services, staff }: { services: ServiceOption[]; staff: StaffOption[] }) {
  const [state, action, pending] = useActionState(createLastMinuteOfferAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Last Minute slot</p>
        <p className="mt-1 text-sm text-muted-foreground">Nabídka volného času pro pozdější blast nebo veřejné zvýraznění.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Začátek
          <input name="startsAt" required type="datetime-local" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Konec
          <input name="endsAt" required type="datetime-local" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Služba
          <select name="serviceId" className="rounded-md border border-input bg-background px-3 py-2">
            <option value="">Jakákoliv služba</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Zaměstnanec
          <select name="staffId" className="rounded-md border border-input bg-background px-3 py-2">
            <option value="">Kdokoliv</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Sleva %
        <input name="discountPercent" inputMode="numeric" defaultValue="0" className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Poznámka
        <textarea name="note" rows={3} maxLength={500} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending}>
        {pending ? "Ukládám..." : "Uložit Last Minute"}
      </Button>
    </form>
  );
}
