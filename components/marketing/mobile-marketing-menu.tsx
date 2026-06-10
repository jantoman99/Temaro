"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { navDirectLinks, navGroups } from "@/components/marketing/landing-navigation";

export function MobileMarketingMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Zavřít menu" : "Otevřít menu"}
        aria-expanded={open}
        className="temaro-focus-ring grid size-10 place-items-center rounded-full bg-[var(--cobalt)] text-white shadow-sm"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X className="size-5" strokeWidth={2.1} /> : <Menu className="size-5" strokeWidth={2.1} />}
      </button>

      {open ? (
        <div className="fixed inset-x-3 top-20 overflow-hidden rounded-[1.5rem] border border-[var(--paper-line)] bg-white shadow-xl">
          <div className="grid gap-1 p-2">
            {navGroups.map((group) => (
              <div key={group.label} className="rounded-[1.1rem] bg-[var(--porcelain)] p-2">
                <p className="section-eyebrow px-2 py-1">{group.label}</p>
                {group.items.map(([href, label, description]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block rounded-xl px-2 py-2.5 text-left transition hover:bg-white"
                    onClick={() => setOpen(false)}
                  >
                    <span className="font-display text-3xl font-semibold text-[var(--ink)]">{label}</span>
                    <span className="mt-1 block text-xs font-semibold leading-5 text-[var(--ink-soft)]">{description}</span>
                  </Link>
                ))}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-1 p-1">
              {navDirectLinks.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-xl bg-[var(--porcelain)] px-3 py-3 text-center text-sm font-bold text-[var(--ink)]"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
