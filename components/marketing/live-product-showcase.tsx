"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { CountUp } from "@/components/motion/count-up";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const BOOKING_POOL = [
  ["09:00", "Lucie Černá", "Foukaná · hotovo"],
  ["11:30", "Marek Horák", "Střih vousů · hotovo"],
  ["14:30", "Adéla Pokorná", "Střih + foukaná · další"],
  ["15:15", "Petr Doležal", "Pánský střih · čeká"],
  ["16:00", "Eva Nováková", "Barva + styling · potvrzeno"],
  ["17:30", "Jana Veselá", "Konzultace · čeká"],
] as const;

const PHONE_TIMES = ["10:30", "13:30", "15:00"] as const;

export function LiveProductShowcase() {
  const reduce = usePrefersReducedMotion();
  const [offset, setOffset] = useState(0);
  const [activeTime, setActiveTime] = useState(0);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (reduce) return;

    const id = setInterval(() => setOffset((current) => (current + 1) % BOOKING_POOL.length), 3600);
    return () => clearInterval(id);
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;

    const id = setInterval(() => {
      setActiveTime((current) => {
        const next = (current + 1) % PHONE_TIMES.length;
        if (next === 0) {
          setConfirm(true);
          setTimeout(() => setConfirm(false), 1800);
        }
        return next;
      });
    }, 1600);

    return () => clearInterval(id);
  }, [reduce]);

  const visibleBookings = [0, 1, 2].map((index) => BOOKING_POOL[(offset + index) % BOOKING_POOL.length]);

  return (
    <section id="produkt" className="clean-saas-showcase relative">
      <div className="rounded-[2rem] border border-border bg-card p-3 shadow-[0_28px_80px_oklch(0.20_0.02_255_/_0.12)]">
        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-secondary/55">
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">T</span>
              temaro.cz/dashboard
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-bold text-success">
              <CountUp to={12} />
              <span>rezervací dnes</span>
            </span>
          </div>

          <div className="grid min-h-[31rem] lg:grid-cols-[11rem_minmax(0,1fr)]">
            <aside className="hidden border-r border-border bg-card/75 p-4 lg:block">
              <p className="text-sm font-bold">Studio Magnolia</p>
              <p className="mt-1 text-xs font-semibold text-secondary-foreground">Salon · Praha</p>
              <nav className="mt-6 grid gap-1.5 text-sm font-semibold text-secondary-foreground">
                {["Přehled", "Rezervace", "Služby", "Klienti"].map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-xl px-3 py-2 ${index === 0 ? "bg-primary text-primary-foreground" : "bg-transparent"}`}
                  >
                    {item}
                  </div>
                ))}
              </nav>
            </aside>

            <div className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Ukázka v počítači i telefonu
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">Přehled provozu</h2>
                </div>
                <button className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
                  Nová rezervace
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary-foreground">Dnes</p>
                  <p className="nums-tabular mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    <CountUp to={12} />
                  </p>
                  <p className="mt-1 text-sm font-semibold text-secondary-foreground">rezervací</p>
                </article>
                <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary-foreground">
                    Vytíženost
                  </p>
                  <p className="nums-tabular mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    <CountUp to={76} suffix=" %" />
                  </p>
                  <p className="mt-1 text-sm font-semibold text-secondary-foreground">tento týden</p>
                </article>
                <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary-foreground">
                    Hodnocení
                  </p>
                  <p className="nums-tabular mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    <CountUp to={4.9} decimals={1} />
                  </p>
                  <p className="mt-1 text-sm font-semibold text-secondary-foreground">
                    <CountUp to={128} /> recenzí
                  </p>
                </article>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-semibold">Dnešní rezervace</p>
                  <p className="text-sm font-semibold text-secondary-foreground">4 celkem</p>
                </div>
                <div className="grid gap-2">
                  {visibleBookings.map(([time, client, service], index) => (
                    <div
                      key={`${offset}-${time}-${client}`}
                      data-motion-booking-row="true"
                      className={`grid grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-xl border border-border bg-secondary/70 px-3 py-2 ${
                        !reduce && index === 2 ? "booking-row-in" : ""
                      }`}
                    >
                      <p className="nums-tabular text-sm font-bold">{time}</p>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{client}</p>
                        <p className="truncate text-xs font-semibold text-secondary-foreground">{service}</p>
                      </div>
                      <span className="rounded-full bg-card px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                        Potvrzeno
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="phone-booking-preview mx-auto mt-5 w-[18rem] rounded-[2rem] border border-border bg-card p-2 shadow-[0_24px_60px_oklch(0.20_0.02_255_/_0.16)] lg:absolute lg:-bottom-8 lg:-right-7 lg:mt-0">
        <div className="relative overflow-hidden rounded-[1.55rem] border border-border bg-background">
          <div className="relative h-28">
            <Image
              src="/marketing/barber-studio-ai.webp"
              alt="Ukázka úvodní fotky rezervační stránky v telefonu"
              fill
              sizes="288px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <div className="absolute bottom-3 left-3 text-white">
              <p className="text-sm font-bold">Studio Magnolia</p>
              <p className="text-xs font-semibold text-white/80">4,9 · Vinohrady</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">Rezervace</p>
              <span className="rounded-full bg-success/10 px-2 py-1 text-[11px] font-bold text-success">Otevřeno</span>
            </div>
            <div className="mt-3 grid gap-2">
              {["Střih + foukaná", "Barva + styling"].map((service) => (
                <div key={service} className="rounded-xl border border-border bg-card px-3 py-2">
                  <p className="text-sm font-semibold">{service}</p>
                  <p className="text-xs font-semibold text-secondary-foreground">60 min · od 650 Kč</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {PHONE_TIMES.map((time, index) => (
                <span
                  key={time}
                  data-motion-phone-time="true"
                  className={`rounded-lg px-2 py-2 text-center text-xs font-bold transition ${
                    !reduce && index === activeTime ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}
                >
                  {time}
                </span>
              ))}
            </div>
            <button className="mt-3 h-10 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              Rezervovat
            </button>
          </div>

          {confirm && (
            <div className="confirm-toast-in absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-xl border border-success/30 bg-card px-3 py-2 shadow-lg">
              <span className="grid size-6 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="size-4" strokeWidth={2} />
              </span>
              <p className="text-xs font-bold text-foreground">Rezervace potvrzena</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
