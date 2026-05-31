#!/usr/bin/env node
/**
 * cx.mjs – Chytrý wrapper pro Codex CLI
 * Automaticky volí reasoning effort podle obsahu promptu.
 *
 * Použití:
 *   node .codex/scripts/cx.mjs "uprav název tlačítka"
 *   node .codex/scripts/cx.mjs "navrhni architekturu pro payments"
 *   node .codex/scripts/cx.mjs --dry "jaký effort by byl zvolen?"
 *
 * Nebo přidej alias do shellu:
 *   alias cx="node /cesta/k/projektu/.codex/scripts/cx.mjs"
 */

import { execSync } from "child_process";

// ─── Pravidla pro detekci složitosti ────────────────────────────────────────

const RULES = [
  {
    effort: "xhigh",
    label: "🔴 xhigh – architekt",
    profile: "architektura",
    keywords: [
      "architektur", "navrhni systém", "celý modul", "multi-tenant",
      "databázový model", "navrhni schéma", "jak postavit", "bezpečnostní audit",
      "security audit", "race condition", "migrace dat", "refaktor celého",
      "zásadní změna", "kompletní přepis",
    ],
  },
  {
    effort: "high",
    label: "🟠 high – hluboké přemýšlení",
    profile: "hluboky",
    keywords: [
      "debug", "proč nefunguje", "najdi bug", "oprav chybu", "security",
      "bezpečnost", "autorizace", "tenant izolace", "race", "zranitelnost",
      "migrace", "db migrat", "vytvoř tabulku", "rls policy",
      "implementuj celý", "nový endpoint", "server action", "složité",
      "komplexní", "review kódu", "code review",
    ],
  },
  {
    effort: "medium",
    label: "🟡 medium – standard",
    profile: "standard",
    keywords: [
      "implementuj", "přidej", "vytvoř komponent", "nová feature",
      "uprav", "refaktor", "přepiš", "vysvětli", "jak funguje",
      "zobrazit", "formulář", "validace", "test", "napiš testy",
    ],
  },
  {
    effort: "low",
    label: "🟢 low – rychlý úkol",
    profile: "rychly",
    keywords: [
      "přejmenuj", "uprav text", "změň barvu", "přidej komentář",
      "oprav překlep", "změň label", "přesuň", "zkrať", "doplň",
      "co je", "ukaž", "vypiš", "seznam", "přehled",
    ],
  },
];

const DEFAULT_EFFORT = "medium";
const DEFAULT_PROFILE = "standard";

// ─── Detekce effort z promptu ────────────────────────────────────────────────

function detectEffort(prompt) {
  const lower = prompt.toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule;
    }
  }

  return {
    effort: DEFAULT_EFFORT,
    label: "🟡 medium – default",
    profile: DEFAULT_PROFILE,
  };
}

// ─── Délka promptu jako sekundární signal ────────────────────────────────────

function adjustForLength(rule, prompt) {
  const wordCount = prompt.split(/\s+/).length;

  // Dlouhý prompt (50+ slov) → zvyš o jeden stupeň
  if (wordCount >= 50 && rule.effort === "low") {
    return RULES.find((r) => r.effort === "medium");
  }
  if (wordCount >= 50 && rule.effort === "medium") {
    return RULES.find((r) => r.effort === "high");
  }

  return rule;
}

// ─── Main ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes("--dry");
const prompt = args.filter((a) => !a.startsWith("--")).join(" ");

if (!prompt) {
  console.error("❌ Chybí prompt.\nPoužití: cx \"co chceš udělat\"");
  process.exit(1);
}

let rule = detectEffort(prompt);
rule = adjustForLength(rule, prompt);

console.log(`\n⚙️  Codex Wrapper`);
console.log(`📝 Prompt:  "${prompt.substring(0, 80)}${prompt.length > 80 ? "..." : ""}"`);
console.log(`🎯 Effort:  ${rule.label}`);
console.log(`👤 Profile: ${rule.profile}`);
console.log("");

if (dryRun) {
  console.log("🔍 Dry run – příkaz který by byl spuštěn:");
  console.log(`   codex --profile ${rule.profile} "${prompt}"\n`);
  process.exit(0);
}

// Spusť Codex s detekovaným profilem
try {
  execSync(
    `codex --profile ${rule.profile} "${prompt.replace(/"/g, '\\"')}"`,
    { stdio: "inherit" }
  );
} catch (err) {
  // Pokud profily nejsou nastavené, fallback na přímý effort flag
  console.log(`⚠️  Profil '${rule.profile}' nenalezen, používám přímý effort flag...`);
  execSync(
    `codex -c model_reasoning_effort="${rule.effort}" "${prompt.replace(/"/g, '\\"')}"`,
    { stdio: "inherit" }
  );
}
