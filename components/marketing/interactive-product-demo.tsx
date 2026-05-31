"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, UserRoundCheck } from "lucide-react";

const demoModes = [
  {
    id: "today",
    label: "Dnes",
    title: "Provoz pod kontrolou",
    subtitle: "4 příchody, 2 volná okna, 1 rizikový klient.",
    metrics: [
      ["8.4k", "tržba dnes"],
      ["4", "příchody"],
      ["2", "volná okna"],
    ],
    checkout: [
      ["01", "Služba", "Barva + styling", "45 min"],
      ["02", "Termín", "Dnes 13:15", "Eva Nováková"],
      ["03", "Kontakt", "Klára Dvořáková", "čeká na potvrzení"],
    ],
  },
  {
    id: "booking",
    label: "Booking",
    title: "Klient si vybere sám",
    subtitle: "Služba, člověk, čas a kontakt bez telefonátu.",
    metrics: [
      ["3", "kroky"],
      ["1 min", "odeslání"],
      ["0×", "přepis"],
    ],
    checkout: [
      ["01", "Služba", "Pánský střih", "30 min"],
      ["02", "Termín", "Zítra 10:30", "Adam Novák"],
      ["03", "Kontakt", "Petr Marek", "potvrzení e-mailem"],
    ],
  },
  {
    id: "client",
    label: "Klient",
    title: "Paměť podniku",
    subtitle: "Historie, preference a riziko jsou u klienta, ne v hlavě.",
    metrics: [
      ["6", "návštěv"],
      ["1", "no-show"],
      ["VIP", "poznámka"],
    ],
    checkout: [
      ["01", "Historie", "Posledně 12. 4.", "barva + styling"],
      ["02", "Preference", "Eva Nováková", "oblíbený člověk"],
      ["03", "Signál", "Riziko zpoždění", "ověřit předem"],
    ],
  },
] as const;

const agenda = [
  { time: "09:00", client: "Adam Novák", service: "Pánský střih", state: "Potvrzeno", tone: "confirm" },
  { time: "10:30", client: "Lucie Veselá", service: "Konzultace", state: "Čeká", tone: "wait" },
  { time: "13:15", client: "Eva Nováková", service: "Barva + styling", state: "Potvrzeno", tone: "confirm" },
  { time: "15:00", client: "Petr Marek", service: "Úprava vousů", state: "Riziko", tone: "risk" },
] as const;

const toneClassNames = {
  confirm: "border-l-success bg-success/10 text-success",
  wait: "border-l-warning bg-warning/10 text-amber-800",
  risk: "border-l-destructive bg-destructive/10 text-destructive",
} as const;

export function InteractiveProductDemo() {
  const [activeModeId, setActiveModeId] = useState<(typeof demoModes)[number]["id"]>("today");
  const activeMode = demoModes.find((mode) => mode.id === activeModeId) ?? demoModes[0];

  return (
    <section id="produkt" className="relative">
      <div className="relative rounded-xl border border-primary/15 bg-card/70 p-3 shadow-[var(--shadow-command)] backdrop-blur-md lg:backdrop-blur-xl">
        <div className="command-surface interactive-demo-shell overflow-hidden rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-destructive/80" />
              <span className="size-2.5 rounded-full bg-warning/80" />
              <span className="size-2.5 rounded-full bg-success/80" />
            </div>
            <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-white/62">
              Temaro Command · živá ukázka
            </div>
            <div className="nums-tabular text-xs font-semibold text-white/42">⌘ K</div>
          </div>

          <div className="border-b border-white/10 px-4 py-3">
            <div className="flex gap-2 overflow-x-auto">
              {demoModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveModeId(mode.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    activeMode.id === mode.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/8 text-white/62 hover:bg-white/12 hover:text-white"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid min-h-[38rem] lg:grid-cols-[14rem_1fr]">
            <aside className="hidden border-r border-white/10 p-4 lg:block">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                  SM
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Studio Magnolia</p>
                  <p className="text-xs font-medium text-white/55">Dnes 12 rezervací</p>
                </div>
              </div>

              <div className="mt-8 space-y-1.5 text-sm font-semibold text-white/55">
                {["Přehled", "Kalendář", "Klienti", "Signály"].map((item, index) => (
                  <div
                    key={item}
                    className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                      index === 0 ? "bg-white/10 text-white" : "hover:bg-white/5"
                    }`}
                  >
                    {index === 0 ? (
                      <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-primary" />
                    ) : null}
                    <span className="size-2 rounded-full bg-current opacity-70" />
                    {item}
                  </div>
                ))}
              </div>
            </aside>

            <div className="bg-secondary p-4 text-foreground sm:p-5">
              <div className="grid gap-4 xl:grid-cols-[1fr_20rem]">
                <div className="space-y-4">
                  <div className="signal-rail rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Live signal</p>
                        <h2 className="mt-1 text-3xl font-semibold tracking-tight">{activeMode.title}</h2>
                        <p className="mt-2 text-sm font-semibold text-muted-foreground">{activeMode.subtitle}</p>
                      </div>
                      <div className="rounded-full border border-success/25 bg-success/10 px-3 py-1.5 text-sm font-bold text-success">
                        Online
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {activeMode.metrics.map(([value, label]) => (
                        <div key={label} className="rounded-xl border border-border bg-secondary/75 p-4">
                          <p className="nums-tabular text-2xl font-semibold tracking-tight">{value}</p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-2xl border border-border bg-secondary/70 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold">Kapacita dne</p>
                        <p className="nums-tabular text-xs font-bold text-muted-foreground">68 % obsazeno</p>
                      </div>
                      <div className="flex h-24 items-end gap-2">
                        {[42, 58, 74, 66, 82, 61, 88].map((height, index) => (
                          <div key={`${height}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                            <span
                              className={`w-full rounded-t-md transition-all duration-500 ${
                                index === 4 ? "bg-primary" : "bg-primary/22"
                              }`}
                              style={{ height: `${height}%` }}
                            />
                            <span className="nums-tabular text-[10px] font-bold text-muted-foreground">
                              {index + 8}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold tracking-tight">Signály dne</p>
                        <p className="text-sm font-semibold text-muted-foreground">Nejbližší rezervace</p>
                      </div>
                      <Clock3 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                      {agenda.map((item) => (
                        <div
                          key={`${item.time}-${item.client}`}
                          className={`grid grid-cols-[3.75rem_1fr_auto] items-center gap-3 rounded-xl border border-border border-l-4 p-3 shadow-sm ${toneClassNames[item.tone]}`}
                        >
                          <p className="nums-tabular text-sm font-bold text-foreground">{item.time}</p>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{item.service}</p>
                            <p className="truncate text-xs font-semibold text-muted-foreground">{item.client}</p>
                          </div>
                          <span className="rounded-full bg-card px-2.5 py-1 text-xs font-bold text-foreground shadow-sm">
                            {item.state}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-semibold tracking-tight">Booking checkout</p>
                      <p className="mt-1 text-sm font-semibold text-muted-foreground">Pohled klienta</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      3 kroky
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {activeMode.checkout.map(([number, label, value, meta]) => (
                      <div key={number} className="rounded-xl border border-border bg-secondary/75 p-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-8 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                            {number}
                          </span>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-foreground">{value}</p>
                        <p className="mt-1 text-xs font-semibold text-muted-foreground">{meta}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl bg-primary p-4 text-primary-foreground shadow-md">
                    <div className="flex items-center gap-2 text-sm font-bold text-primary-foreground/75">
                      <CheckCircle2 className="size-4" />
                      Připraveno k odeslání
                    </div>
                    <p className="mt-2 text-lg font-semibold">Rezervace hotová za minutu.</p>
                  </div>

                  <div className="mt-4 rounded-xl border border-border bg-secondary/75 p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <UserRoundCheck className="size-5" strokeWidth={1.9} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Klientský kontext</p>
                        <p className="text-xs font-semibold text-muted-foreground">historie, preference, další termín</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
