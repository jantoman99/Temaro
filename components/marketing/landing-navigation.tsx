"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export const navGroups = [
  {
    label: "Produkt",
    items: [
      ["#jak-to-funguje", "Jak to funguje", "Od služeb a týmu po první online rezervaci."],
      ["#bento", "Proč Temaro", "Kanály, kalendář a klidnější den v jednom pohledu."],
      ["#produktove-demo", "Produktová ukázka", "Jak vypadá provozní den uvnitř systému."],
    ],
  },
  {
    label: "Návody",
    items: [
      ["/jak-snizit-no-show", "Jak snížit no-show", "Připomínky, bezpečné změny a práce s rizikem."],
      ["/sms-pripominky-rezervaci", "SMS připomínky", "Kdy SMS dává smysl a kdy je zbytečně drahá."],
      ["/rezervacni-system-bez-marketplace-provizi", "Bez marketplace provizí", "Váš klientský vztah bez provize z vlastních klientů."],
    ],
  },
] as const;

export const navDirectLinks = [
  ["#cenik", "Ceník"],
  ["/ukazka", "Ukázka"],
] as const;

export function LandingNavigation() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const baseId = useId();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenGroup(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="hidden lg:flex w-auto items-center gap-1"
      aria-label="Hlavní navigace"
    >
      {navGroups.map((group) => {
        const isOpen = openGroup === group.label;
        const panelId = `${baseId}-${group.label}`;

        return (
          <div key={group.label} className="relative">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="temaro-focus-ring flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-[var(--ink-soft)] transition hover:bg-[var(--porcelain-deep)] hover:text-[var(--ink)]"
              onClick={() => setOpenGroup(isOpen ? null : group.label)}
            >
              {group.label}
              <ChevronDown className={`size-4 transition ${isOpen ? "rotate-180" : ""}`} strokeWidth={1.8} />
            </button>

            {isOpen ? (
              <div
                id={panelId}
                className="mt-1 rounded-2xl border border-[var(--paper-line)] bg-white p-2 shadow-lg lg:absolute lg:left-1/2 lg:top-full lg:z-40 lg:mt-3 lg:w-[25rem] lg:-translate-x-1/2"
              >
                {group.items.map(([href, label, description]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--porcelain)]"
                    onClick={() => setOpenGroup(null)}
                  >
                    <span className="text-sm font-bold text-[var(--ink)]">{label}</span>
                    <span className="mt-1 block text-xs font-semibold leading-5 text-[var(--ink-soft)]">
                      {description}
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}

      {navDirectLinks.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className="temaro-focus-ring rounded-full px-2 py-2 text-center text-sm font-bold text-[var(--ink-soft)] transition hover:bg-[var(--porcelain-deep)] hover:text-[var(--ink)] lg:px-3"
          onClick={() => setOpenGroup(null)}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
