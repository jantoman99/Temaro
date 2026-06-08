"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

const navGroups = [
  {
    label: "Produkt",
    items: [
      ["#jak-to-funguje", "Jak to funguje", "Od služeb a týmu po první online rezervaci."],
      ["#booking-kanaly", "Booking kanály", "Web, Instagram, Google profil, QR a widget."],
      ["#provoz", "Proč Temaro", "Méně telefonátů, méně chaosu v kalendáři."],
    ],
  },
  {
    label: "Řešení",
    items: [
      ["/rezervacni-system-pro-barbery", "Barber shopy", "Termíny podle služby, člověka a volného okna."],
      ["/rezervacni-system-pro-kadernictvi", "Kadeřnictví", "Týmový kalendář a historie návštěv."],
      ["/rezervacni-system-pro-kosmeticky-salon", "Beauty salony", "Přehled klientů, poznámky a připomínky."],
      ["/rezervacni-system-pro-masaze", "Masáže a wellness", "Delší termíny, klidnější kapacita dne."],
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

const navDirectLinks = [
  ["/podniky", "Pro zákazníky"],
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
      className="order-3 grid w-full gap-1 border-t border-border/70 pt-2 sm:grid-cols-2 lg:order-none lg:flex lg:w-auto lg:items-center lg:border-t-0 lg:pt-0"
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
              className="flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground lg:w-auto lg:px-3"
              onClick={() => setOpenGroup(isOpen ? null : group.label)}
            >
              {group.label}
              <ChevronDown className={`size-4 transition ${isOpen ? "rotate-180" : ""}`} strokeWidth={1.8} />
            </button>

            {isOpen ? (
              <div
                id={panelId}
                className="mt-1 rounded-xl border border-border bg-card p-2 shadow-lg lg:absolute lg:left-1/2 lg:top-full lg:z-40 lg:mt-3 lg:w-[25rem] lg:-translate-x-1/2"
              >
                {group.items.map(([href, label, description]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block rounded-lg px-3 py-2.5 text-left transition hover:bg-muted"
                    onClick={() => setOpenGroup(null)}
                  >
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                    <span className="mt-1 block text-xs font-medium leading-5 text-secondary-foreground">
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
          className="rounded-md px-2 py-2 text-center text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground lg:px-3"
          onClick={() => setOpenGroup(null)}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
