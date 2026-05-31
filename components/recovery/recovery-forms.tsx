"use client";

import { useActionState } from "react";

import { addRecoveryRecipientAction, createRecoveryOfferAction } from "@/app/(dashboard)/recovery/actions";
import { Button } from "@/components/ui/button";

type Option = { id: string; name: string };

function ActionMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;

  return <p className={error ? "text-sm font-semibold text-destructive" : "text-sm font-semibold text-success"}>{error ?? success}</p>;
}

export function RecoveryOfferForm({
  services,
  staff,
}: {
  services: Option[];
  staff: Option[];
}) {
  const [state, action, pending] = useActionState(createRecoveryOfferAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Uvolněný termín</p>
        <p className="mt-1 text-sm text-muted-foreground">Připraví cílenou nabídku pro vybrané klienty. Odesílání se napojí po providerovi.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Služba
        <select name="serviceId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte službu</option>
          {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Člen týmu
        <select name="staffId" className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Kdokoliv</option>
          {staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="startsAt" type="datetime-local" required className="rounded-md border border-input bg-background px-3 py-2" />
        <input name="endsAt" type="datetime-local" required className="rounded-md border border-input bg-background px-3 py-2" />
      </div>
      <input name="discountPercent" inputMode="numeric" placeholder="Sleva %" className="rounded-md border border-input bg-background px-3 py-2" />
      <textarea name="note" rows={3} maxLength={500} placeholder="Interní poznámka / text nabídky" className="rounded-md border border-input bg-background px-3 py-2" />
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending || services.length === 0}>{pending ? "Ukládám..." : "Vytvořit nabídku"}</Button>
    </form>
  );
}

export function RecoveryRecipientForm({
  clients,
  offers,
}: {
  clients: Option[];
  offers: Option[];
}) {
  const [state, action, pending] = useActionState(addRecoveryRecipientAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Přidat klienta</p>
        <p className="mt-1 text-sm text-muted-foreground">Klient se pouze vybere do nabídky; nic se zatím automaticky neposílá.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Nabídka
        <select name="offerId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte nabídku</option>
          {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.name}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Klient
        <select name="clientId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte klienta</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
      </label>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending || clients.length === 0 || offers.length === 0}>
        {pending ? "Přidávám..." : "Přidat klienta"}
      </Button>
    </form>
  );
}
