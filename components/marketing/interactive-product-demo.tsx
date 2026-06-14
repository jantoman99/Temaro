"use client";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  Link2,
  Search,
  Settings2,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const crmDemoViews = [
  {
    id: "overview",
    label: "Přehled",
    title: "Přehled provozu",
    description: "KPI strip, dnešní rezervace, tržba, volná okna a riziko před otevřením kalendáře.",
    icon: LayoutDashboard,
  },
  {
    id: "calendar",
    label: "Kalendář",
    title: "Kalendář",
    description: "Týden × čas, barevné rezervace podle týmu, filtry a detail vybraného termínu.",
    icon: CalendarDays,
  },
  {
    id: "booking",
    label: "Detail rezervace",
    title: "Vybraný termín",
    description: "Klient, služba, stav, zdroj, záloha, připomínka a historie změn v jednom panelu.",
    icon: Clock3,
  },
  {
    id: "clients",
    label: "Klienti",
    title: "Klienti",
    description: "CRM tabulka s hledáním, rizikem, kontaktem a rychlou akcí na novou rezervaci.",
    icon: UsersRound,
  },
  {
    id: "bookingPage",
    label: "Rezervační stránka",
    title: "Rezervační stránka",
    description: "Nastavení veřejného odkazu, QR, widgetu a zákaznického brandingu bez odchodu z CRM.",
    icon: Link2,
  },
] as const;

type CrmDemoViewId = (typeof crmDemoViews)[number]["id"];

const days = [
  ["po", "Po", "15. 6."],
  ["ut", "Út", "16. 6."],
  ["st", "St", "17. 6."],
  ["ct", "Čt", "18. 6."],
  ["pa", "Pá", "19. 6."],
] as const;

const hours = ["07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"] as const;

const calendarBookings = [
  {
    id: "b1",
    day: "po",
    top: 92,
    height: 86,
    left: 0,
    width: 100,
    time: "09:00",
    client: "Adam Novák",
    service: "Pánský střih",
    staff: "Tomáš",
    status: "Potvrzeno",
    source: "Zdroj: online",
    color: "#2B3FF2",
  },
  {
    id: "b2",
    day: "ut",
    top: 214,
    height: 106,
    left: 0,
    width: 100,
    time: "10:30",
    client: "Lucie Veselá",
    service: "Konzultace + střih",
    staff: "Barbora",
    status: "Čeká",
    source: "Zdroj: Instagram",
    color: "#FFB98A",
  },
  {
    id: "b3",
    day: "st",
    top: 384,
    height: 96,
    left: 0,
    width: 100,
    time: "13:15",
    client: "Eva Nováková",
    service: "Barva + styling",
    staff: "Eva",
    status: "Potvrzeno",
    source: "Zdroj: online",
    color: "#1BAA69",
  },
  {
    id: "b4",
    day: "ct",
    top: 504,
    height: 72,
    left: 0,
    width: 100,
    time: "15:00",
    client: "Petr Marek",
    service: "Úprava vousů",
    staff: "Tomáš",
    status: "Riziko",
    source: "Zdroj: Google",
    color: "#E5484D",
  },
  {
    id: "b5",
    day: "pa",
    top: 252,
    height: 82,
    left: 0,
    width: 100,
    time: "11:00",
    client: "Jana Králová",
    service: "Masáž zad",
    staff: "Nina",
    status: "Potvrzeno",
    source: "Zdroj: QR",
    color: "#6F5CF6",
  },
] as const;

const clients = [
  ["Eva Nováková", "eva@example.cz", "0 no-show", "Trusted"],
  ["Lucie Veselá", "+420 777 123 456", "1 přesun", "Pozor"],
  ["Adam Novák", "adam@example.cz", "0 no-show", "Standard"],
] as const;

function getStatusClass(status: string) {
  if (status === "Potvrzeno") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Čeká") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "Riziko") return "border-red-200 bg-red-50 text-red-700";
  return "border-[var(--paper-line)] bg-white text-[var(--ink-soft)]";
}

function CrmSidebar({
  activeViewId,
  selectView,
}: {
  activeViewId: CrmDemoViewId;
  selectView: (viewId: CrmDemoViewId) => void;
}) {
  return (
    <aside className="crm-sidebar hidden w-56 shrink-0 border-r border-white/10 bg-[#11141B] p-3 text-white lg:block">
      <div className="mb-5 rounded-2xl bg-white/7 p-3">
        <p className="text-sm font-bold">Temaro</p>
        <p className="mt-1 text-xs font-semibold text-white/45">Studio Magnolia</p>
      </div>
      <nav className="grid gap-1 text-sm font-semibold">
        {crmDemoViews.map((view) => {
          const Icon = view.icon;
          const isActive = view.id === activeViewId;

          return (
            <button
              key={view.id}
              className={`temaro-focus-ring flex h-10 items-center gap-3 rounded-xl px-3 text-left transition ${
                isActive ? "bg-white/12 text-white" : "text-white/58 hover:bg-white/7 hover:text-white"
              }`}
              onClick={() => selectView(view.id)}
              type="button"
            >
              <Icon className="size-4" strokeWidth={1.8} />
              {view.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function KpiStrip({ selectView }: { selectView: (viewId: CrmDemoViewId) => void }) {
  const items = [
    ["Dnešní rezervace", "12", "stabilní den", "border-blue-200 bg-blue-50 text-blue-700"],
    ["Tržba dnes", "8 400 Kč", "z dokončených rezervací", "border-emerald-200 bg-emerald-50 text-emerald-700"],
    ["Volná okna", "3", "kapacita dostupná", "border-orange-200 bg-orange-50 text-orange-800"],
    ["Riziko", "1", "vyžaduje pozornost", "border-red-200 bg-red-50 text-red-700"],
  ] as const;

  return (
    <section className="grid gap-3 xl:grid-cols-4">
      <div className="rounded-2xl border border-[var(--paper-line)] bg-white p-4 shadow-sm xl:col-span-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">Dnes</p>
            <h3 className="mt-1 text-2xl font-bold tracking-[-0.04em]">Přehled provozu</h3>
          </div>
          <button
            className="temaro-focus-ring inline-flex h-10 items-center justify-center rounded-xl bg-[var(--cobalt)] px-4 text-sm font-bold text-white"
            onClick={() => selectView("calendar")}
            type="button"
          >
            Otevřít kalendář
          </button>
        </div>
      </div>
      {items.map(([label, value, note, tone]) => (
        <article key={label} className={`rounded-2xl border p-4 shadow-sm ${tone}`}>
          <p className="text-xs font-bold uppercase tracking-[0.13em] opacity-75">{label}</p>
          <p className="font-time mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)]">{value}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] opacity-75">{note}</p>
          <div className="mt-4 flex h-8 items-end gap-1">
            {[35, 54, 42, 72, 64, 80, 58].map((height, index) => (
              <span key={index} className="w-full rounded-t bg-current/35" style={{ height: `${height}%` }} />
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function CalendarGrid({
  selectedBookingId,
  setSelectedBookingId,
}: {
  selectedBookingId: string;
  setSelectedBookingId: (bookingId: string) => void;
}) {
  return (
    <section className="crm-calendar-grid overflow-hidden rounded-2xl border border-[var(--paper-line)] bg-white shadow-sm">
      <div className="border-b border-[var(--paper-line)] bg-[var(--porcelain)] px-4 py-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">Týdenní kalendář</p>
            <h3 className="mt-1 text-lg font-bold tracking-[-0.03em]">Týden × čas</h3>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {["Tým: všichni", "Stav: aktivní", "Zdroj: online", "Den × čas"].map((item) => (
              <span key={item} className="rounded-full border border-[var(--paper-line)] bg-white px-3 py-1.5 text-[var(--ink-soft)]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-auto">
        <div className="grid min-w-[700px]" style={{ gridTemplateColumns: "46px repeat(5, minmax(104px, 1fr))" }}>
          <div className="border-r border-[var(--paper-line)] bg-[var(--porcelain)]" />
          {days.map(([, label, date]) => (
            <div key={date} className="border-r border-[var(--paper-line)] bg-white px-3 py-2 text-center last:border-r-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">{label}</p>
              <p className="font-time mt-1 text-sm font-semibold">{date}</p>
            </div>
          ))}

          <div className="relative border-r border-[var(--paper-line)] bg-[var(--porcelain)]" style={{ height: 650 }}>
            {hours.map((hour, index) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-[var(--paper-line)] px-2 pt-1 text-right"
                style={{ top: index * 50 }}
              >
                <span className="font-time text-[11px] font-semibold text-[var(--ink-soft)]">{hour}</span>
              </div>
            ))}
          </div>

          {days.map(([dayId]) => (
            <div key={dayId} className="relative border-r border-[var(--paper-line)] bg-[linear-gradient(to_bottom,#fff,#fff),repeating-linear-gradient(135deg,transparent_0,transparent_10px,#f2f0ea_10px,#f2f0ea_11px)] last:border-r-0" style={{ height: 650 }}>
              {hours.map((hour, index) => (
                <div key={hour} className="absolute left-0 right-0 border-t border-[var(--paper-line)]" style={{ top: index * 50 }} />
              ))}
              {calendarBookings
                .filter((booking) => booking.day === dayId)
                .map((booking) => {
                  const isSelected = booking.id === selectedBookingId;

                  return (
                    <button
                      key={booking.id}
                      className={`absolute z-10 rounded-lg border bg-white px-2 py-1 text-left text-xs shadow-sm transition hover:-translate-y-0.5 ${
                        isSelected ? "ring-4 ring-[var(--cobalt)]/15" : ""
                      }`}
                      onClick={() => setSelectedBookingId(booking.id)}
                      style={{
                        borderColor: booking.color,
                        borderLeftColor: booking.color,
                        borderLeftWidth: 5,
                        height: booking.height,
                        left: `calc(${booking.left}% + 5px)`,
                        top: booking.top,
                        width: `calc(${booking.width}% - 10px)`,
                      }}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-time text-[11px] font-semibold">{booking.time}</span>
                        <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${getStatusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[12px] font-bold">{booking.client}</p>
                      <p className="mt-0.5 truncate text-[11px] font-semibold text-[var(--ink-soft)]">
                        {booking.service} · {booking.staff}
                      </p>
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BookingDetailPanel({ bookingId }: { bookingId: string }) {
  const booking = calendarBookings.find((item) => item.id === bookingId) ?? calendarBookings[1];

  return (
    <aside className="crm-booking-detail rounded-2xl border border-[var(--paper-line)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">Vybraný termín</p>
          <h3 className="mt-2 text-xl font-bold tracking-[-0.04em]">{booking.service}</h3>
          <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">
            {booking.time} · {booking.client}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClass(booking.status)}`}>{booking.status}</span>
      </div>

      <dl className="mt-4 grid gap-2 text-sm">
        {[
          ["Klient", booking.client],
          ["Zaměstnanec", booking.staff],
          ["Zdroj", booking.source],
          ["Záloha", booking.id === "b2" ? "300 Kč čeká" : "Zaplaceno"],
          ["Připomínka", "SMS zítra 09:00"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[var(--paper-line)] bg-[var(--porcelain)] p-3">
            <dt className="text-xs font-semibold text-[var(--ink-soft)]">{label}</dt>
            <dd className="mt-1 font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
        {booking.id === "b2" ? "Klientka už jednou přesouvala termín. Systém drží kontext přímo u rezervace." : "Termín je bez rizikového signálu."}
      </div>
    </aside>
  );
}

function OverviewView({ selectView }: { selectView: (viewId: CrmDemoViewId) => void }) {
  return (
    <div className="grid gap-4">
      <KpiStrip selectView={selectView} />
      <div className="grid gap-4 2xl:grid-cols-[1fr_20rem]">
        <CalendarGrid selectedBookingId="b2" setSelectedBookingId={() => selectView("calendar")} />
        <BookingDetailPanel bookingId="b2" />
      </div>
    </div>
  );
}

function CalendarView() {
  const [selectedBookingId, setSelectedBookingId] = useState("b2");

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_20rem]">
      <CalendarGrid selectedBookingId={selectedBookingId} setSelectedBookingId={setSelectedBookingId} />
      <BookingDetailPanel bookingId={selectedBookingId} />
    </div>
  );
}

function BookingView() {
  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_22rem]">
      <CalendarGrid selectedBookingId="b2" setSelectedBookingId={() => undefined} />
      <BookingDetailPanel bookingId="b2" />
    </div>
  );
}

function ClientsView() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--paper-line)] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[var(--paper-line)] bg-[var(--porcelain)] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">Klienti</p>
          <h3 className="mt-1 text-lg font-bold tracking-[-0.03em]">CRM tabulka</h3>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--paper-line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink-soft)]">
          <Search className="size-4" />
          Hledat klienta
        </div>
      </div>
      <div className="grid min-w-[680px] grid-cols-[1.1fr_1fr_0.7fr_0.7fr_auto] border-b border-[var(--paper-line)] bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
        <span>Klient</span>
        <span>Kontakt</span>
        <span>Riziko</span>
        <span>Profil</span>
        <span>Akce</span>
      </div>
      <div className="overflow-auto">
        {clients.map(([name, contact, risk, profile]) => (
          <div key={name} className="grid min-w-[680px] grid-cols-[1.1fr_1fr_0.7fr_0.7fr_auto] items-center border-b border-[var(--paper-line)] px-4 py-3 text-sm last:border-b-0">
            <strong>{name}</strong>
            <span className="font-semibold text-[var(--ink-soft)]">{contact}</span>
            <span className="font-semibold">{risk}</span>
            <span className="font-semibold">{profile}</span>
            <button className="rounded-lg bg-[var(--cobalt)] px-3 py-2 text-xs font-bold text-white" type="button">
              Rezervovat
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function BookingPageView() {
  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_20rem]">
      <div className="rounded-2xl border border-[var(--paper-line)] bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">Rezervační stránka</p>
            <h3 className="mt-1 text-2xl font-bold tracking-[-0.04em]">temaro.cz/studio-magnolia</h3>
            <p className="mt-2 text-sm font-semibold text-[var(--ink-soft)]">Služby, tým, pracovní doba, QR a widget pro web podniku.</p>
          </div>
          <Settings2 className="size-5 text-[var(--cobalt)]" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {["Vlastní odkaz", "QR kód", "Widget"].map((item) => (
            <article key={item} className="rounded-2xl border border-[var(--paper-line)] bg-[var(--porcelain)] p-4">
              <p className="text-sm font-bold">{item}</p>
              <p className="mt-2 text-xs font-semibold leading-5 text-[var(--ink-soft)]">Správa přímo v interním CRM, bez externí prezentace.</p>
            </article>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-[var(--paper-line)] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold">Náhled veřejné rezervace</p>
        <div className="mt-4 rounded-[1.5rem] border-[8px] border-[var(--ink)] p-4">
          <p className="text-sm font-bold">Studio Magnolia</p>
          <p className="mt-1 text-xs font-semibold text-[var(--ink-soft)]">Pánský střih · 45 min</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {["09:00", "10:30", "13:15", "15:00"].map((time, index) => (
              <span key={time} className={`rounded-full px-3 py-2 text-center font-time text-sm font-semibold ${index === 1 ? "bg-[var(--cobalt)] text-white" : "bg-[var(--porcelain)]"}`}>
                {time}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActiveView({
  activeViewId,
  selectView,
}: {
  activeViewId: CrmDemoViewId;
  selectView: (viewId: CrmDemoViewId) => void;
}) {
  if (activeViewId === "overview") return <OverviewView selectView={selectView} />;
  if (activeViewId === "calendar") return <CalendarView />;
  if (activeViewId === "booking") return <BookingView />;
  if (activeViewId === "clients") return <ClientsView />;
  return <BookingPageView />;
}

export function InteractiveProductDemo() {
  const reduceMotion = usePrefersReducedMotion();
  const [activeViewId, setActiveViewId] = useState<CrmDemoViewId>("calendar");
  const [hasInteracted, setHasInteracted] = useState(false);
  const activeIndex = crmDemoViews.findIndex((view) => view.id === activeViewId);
  const activeView = useMemo(() => crmDemoViews[activeIndex] ?? crmDemoViews[1], [activeIndex]);

  function selectView(viewId: CrmDemoViewId) {
    setHasInteracted(true);
    setActiveViewId(viewId);
  }

  function nextView() {
    setHasInteracted(true);
    setActiveViewId(crmDemoViews[(activeIndex + 1) % crmDemoViews.length].id);
  }

  useEffect(() => {
    if (reduceMotion || hasInteracted) return;

    const interval = window.setInterval(() => {
      setActiveViewId((current) => {
        const currentIndex = crmDemoViews.findIndex((view) => view.id === current);
        return crmDemoViews[(currentIndex + 1) % crmDemoViews.length].id;
      });
    }, 5200);

    return () => window.clearInterval(interval);
  }, [hasInteracted, reduceMotion]);

  return (
    <section className="crm-demo-shell overflow-hidden rounded-[2rem] border border-white/70 bg-[#151923] shadow-[0_34px_110px_rgba(23,26,33,0.24)]" aria-label="Klikatelná ukázka interního CRM Temaro">
      <div className="flex min-h-[42rem]">
        <CrmSidebar activeViewId={activeViewId} selectView={selectView} />
        <div className="min-w-0 flex-1 bg-[var(--porcelain)]">
          <div className="flex flex-col gap-3 border-b border-[var(--paper-line)] bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">Reálný pohled po přihlášení</p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">{activeView.title}</h2>
              <p className="mt-1 max-w-2xl text-sm font-semibold text-[var(--ink-soft)]">{activeView.description}</p>
            </div>
            <button
              className="temaro-focus-ring inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--cobalt)] px-4 text-sm font-bold text-white"
              onClick={nextView}
              type="button"
            >
              Další obrazovka
              <ArrowRight className="size-4" />
            </button>
          </div>
          <div className="grid gap-3 border-b border-[var(--paper-line)] bg-white/72 px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-auto">
              {crmDemoViews.map((view) => (
                <button
                  key={view.id}
                  className={`shrink-0 rounded-full border px-3 py-2 text-sm font-bold ${
                    view.id === activeViewId ? "border-[var(--cobalt)] bg-[var(--cobalt)] text-white" : "border-[var(--paper-line)] bg-white text-[var(--ink-soft)]"
                  }`}
                  onClick={() => selectView(view.id)}
                  type="button"
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 md:p-4">
            <ActiveView activeViewId={activeViewId} selectView={selectView} />
          </div>
        </div>
      </div>
    </section>
  );
}
