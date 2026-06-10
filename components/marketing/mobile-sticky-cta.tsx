"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function MobileStickyCta() {
  const [pastHero, setPastHero] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("produkt");
    const footer = document.querySelector("footer");

    const heroObserver = hero
      ? new IntersectionObserver(([entry]) => setPastHero(!entry?.isIntersecting), { threshold: 0.08 })
      : null;
    const footerObserver = footer
      ? new IntersectionObserver(([entry]) => setNearFooter(Boolean(entry?.isIntersecting)), { threshold: 0.02 })
      : null;

    if (hero) heroObserver?.observe(hero);
    if (footer) footerObserver?.observe(footer);

    return () => {
      heroObserver?.disconnect();
      footerObserver?.disconnect();
    };
  }, []);

  if (!pastHero || nearFooter) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--paper-line)] bg-[var(--porcelain)]/90 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-18px_50px_rgba(23,26,33,0.12)] backdrop-blur sm:hidden">
      <p className="font-time mb-2 text-center text-xs font-medium text-[var(--ink-soft)]">0 Kč · bez karty</p>
      <Link
        href="/register"
        className="temaro-focus-ring inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--cobalt)] text-sm font-bold text-white shadow-[0_18px_50px_rgba(43,63,242,0.30)]"
      >
        Začít zdarma
      </Link>
    </div>
  );
}
