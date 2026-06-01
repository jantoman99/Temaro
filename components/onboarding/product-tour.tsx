"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { PRODUCT_TOUR_STEPS } from "@/lib/product-tour";

const STORAGE_KEY = "temaro-product-tour-seen";
const START_EVENT = "temaro:start-product-tour";

function markTarget(target: string | null) {
  document.querySelectorAll("[data-tour-active='true']").forEach((element) => {
    element.removeAttribute("data-tour-active");
    element.classList.remove("ring-4", "ring-primary/25", "ring-offset-2", "ring-offset-background");
  });

  if (!target) return;

  const element = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);

  if (!element) return;

  element.dataset.tourActive = "true";
  element.classList.add("ring-4", "ring-primary/25", "ring-offset-2", "ring-offset-background");
  element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}

export function ProductTour() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeStep = activeIndex === null ? null : PRODUCT_TOUR_STEPS[activeIndex] ?? null;

  useEffect(() => {
    function startTour() {
      setActiveIndex(0);
    }

    window.addEventListener(START_EVENT, startTour);

    const hasSeenTour = window.localStorage.getItem(STORAGE_KEY) === "true";
    const startTimer = hasSeenTour ? null : window.setTimeout(startTour, 700);

    return () => {
      window.removeEventListener(START_EVENT, startTour);
      if (startTimer) window.clearTimeout(startTimer);
      markTarget(null);
    };
  }, []);

  useEffect(() => {
    markTarget(activeStep?.target ?? null);
  }, [activeStep]);

  function closeTour() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setActiveIndex(null);
  }

  function showNext() {
    if (activeIndex === null || activeIndex >= PRODUCT_TOUR_STEPS.length - 1) {
      closeTour();
      return;
    }

    setActiveIndex(activeIndex + 1);
  }

  if (!activeStep || activeIndex === null) {
    return null;
  }

  return (
    <aside className="fixed bottom-4 right-4 z-50 w-[min(92vw,380px)] rounded-3xl border border-border bg-card p-5 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Průvodce {activeIndex + 1}/{PRODUCT_TOUR_STEPS.length}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">{activeStep.title}</h2>
        </div>
        <button
          type="button"
          onClick={closeTour}
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Zavřít průvodce"
        >
          <X className="size-4" />
        </button>
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{activeStep.body}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" onClick={closeTour} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
          Přeskočit
        </button>
        <button
          type="button"
          onClick={showNext}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          {activeIndex >= PRODUCT_TOUR_STEPS.length - 1 ? "Dokončit" : "Další"}
        </button>
      </div>
    </aside>
  );
}

export function ProductTourLauncher() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(START_EVENT))}
      className="h-10 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
    >
      Spustit průvodce
    </button>
  );
}
