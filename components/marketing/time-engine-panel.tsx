"use client";

import { AlertTriangle } from "lucide-react";

import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type EngineSlot = {
  time: string;
  title: string;
  tone: string;
  iconTone?: string;
};

type TimeEnginePanelProps = {
  messageCloud: readonly string[];
  engineSlots: readonly EngineSlot[];
};

export function TimeEnginePanel({ messageCloud, engineSlots }: TimeEnginePanelProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduceMotion = usePrefersReducedMotion();
  const active = inView && !reduceMotion;

  return (
    <div
      ref={ref}
      className="time-engine-flow mt-8 rounded-[2rem] border border-[var(--paper-line)] bg-[var(--ink)] p-4 text-white shadow-[0_30px_90px_rgba(23,26,33,0.24)]"
      data-engine-active={active}
    >
      <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.4rem] bg-white/[0.06] p-4">
          <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-white/62">příchozí chaos</p>
          <div className="mt-4 grid gap-2">
            {messageCloud.map((message, index) => (
              <span
                key={message}
                className="engine-message rounded-full border border-white/12 bg-white px-3 py-2 text-xs font-semibold text-[var(--ink)]"
                style={{ animationDelay: `${index * 180}ms` }}
              >
                {message}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[1.4rem] bg-white p-4 text-[var(--ink)]">
          <div className="flex items-center justify-between gap-3">
            <p className="section-eyebrow">složený den</p>
            <span className="font-time rounded-full bg-[var(--cobalt-tint)] px-3 py-1 text-xs font-semibold text-[var(--cobalt)]">
              12 rezervací
            </span>
          </div>
          <div className="mt-4 grid gap-2">
            {engineSlots.map((slot, index) => (
              <div
                key={`${slot.time}-${slot.title}`}
                className={`engine-slot grid grid-cols-[4rem_1fr] items-center gap-3 rounded-2xl px-3 py-2 text-sm font-bold ${slot.tone}`}
                style={{ animationDelay: `${index * 160}ms` }}
              >
                <span className="font-time text-xs">{slot.time}</span>
                <span className="inline-flex min-w-0 items-center gap-2">
                  {slot.iconTone ? <AlertTriangle className={`size-4 shrink-0 ${slot.iconTone}`} strokeWidth={2.1} /> : null}
                  <span className="truncate">{slot.title}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
