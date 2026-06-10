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
        className="grid size-10 place-items-center rounded-full bg-[#606C38] text-[#E8DCC7] shadow-sm"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X className="size-5" strokeWidth={2.1} /> : <Menu className="size-5" strokeWidth={2.1} />}
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] overflow-hidden rounded-2xl border border-[#606C38]/18 bg-[#f7eddc] shadow-xl">
          <div className="grid gap-1 p-2">
            {navGroups.map((group) => (
              <div key={group.label} className="rounded-xl bg-[#E8DCC7]/70 p-2">
                <p className="px-2 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#606C38]">{group.label}</p>
                {group.items.map(([href, label, description]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block rounded-lg px-2 py-2.5 text-left transition hover:bg-[#f7eddc]"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-sm font-bold text-[#24170f]">{label}</span>
                    <span className="mt-1 block text-xs font-medium leading-5 text-[#5c4a39]">{description}</span>
                  </Link>
                ))}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-1 p-1">
              {navDirectLinks.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-xl bg-[#E8DCC7] px-3 py-3 text-center text-sm font-bold text-[#24170f]"
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
