"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "temaro-theme";
const modes: { icon: typeof Sun; label: string; value: ThemeMode }[] = [
  { icon: Sun, label: "Světlý", value: "light" },
  { icon: Moon, label: "Tmavý", value: "dark" },
];

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export function ThemeToggle({ compact = false, tone = "default" }: { compact?: boolean; tone?: "default" | "editorial" }) {
  const [mode, setMode] = useState<ThemeMode>("light");
  const isEditorial = tone === "editorial";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedMode = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      const nextMode = storedMode === "dark" ? "dark" : "light";
      setMode(nextMode);
      applyTheme(nextMode);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  function selectMode(nextMode: ThemeMode) {
    setMode(nextMode);
    window.localStorage.setItem(STORAGE_KEY, nextMode);
    applyTheme(nextMode);
  }

  return (
    <div
      className={`inline-flex items-center rounded-md border p-1 shadow-sm ${compact ? "" : "gap-1"} ${
        isEditorial ? "border-[#606C38]/18 bg-[#f7eddc]/78" : "border-border bg-card"
      }`}
    >
      {modes.map((item) => {
        const Icon = item.icon;
        const isActive = mode === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => selectMode(item.value)}
            aria-label={`Přepnout vzhled: ${item.label}`}
            className={`inline-flex h-8 items-center justify-center gap-1.5 rounded px-2 text-xs font-semibold transition ${
              isEditorial
                ? isActive
                  ? "bg-[#606C38] text-[#E8DCC7]"
                  : "text-[#5c4a39] hover:bg-[#E8DCC7] hover:text-[#24170f]"
                : isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" />
            {compact ? null : <span className="hidden sm:inline">{item.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
