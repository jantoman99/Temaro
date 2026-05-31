# cx wrapper – Návod

Chytrý wrapper pro Codex CLI který automaticky volí reasoning effort
podle obsahu promptu. Šetří tokeny na jednoduchých úkolech,
nasadí plnou sílu na složité.

---

## Instalace

### Option A – Alias v shellu (doporučeno)

Přidej do `~/.bashrc`, `~/.zshrc` nebo `~/.profile`:

```bash
alias cx="node /cesta/k/projektu/.codex/scripts/cx.mjs"
```

Pak restartuj terminál nebo spusť:
```bash
source ~/.zshrc
```

### Option B – Spouštění přímo

```bash
node .codex/scripts/cx.mjs "tvůj prompt"
```

---

## Použití

```bash
# Automatická detekce (nejčastější)
cx "přejmenuj tlačítko z Save na Uložit"
# → 🟢 low – rychlý úkol (gpt-5.4-mini)

cx "implementuj endpoint pro vytvoření rezervace"
# → 🟡 medium – standard (gpt-5.4)

cx "najdi proč nefunguje tenant izolace v bookings endpointu"
# → 🟠 high – hluboké přemýšlení (gpt-5.4)

cx "navrhni architekturu pro platební systém se Stripe"
# → 🔴 xhigh – architekt (gpt-5.4)

# Dry run – ukáže co by bylo spuštěno, ale nespustí Codex
cx --dry "implementuj booking flow"

# Přímé použití profilu (bez wrapperu)
codex --profile hluboky "debug race condition v rezervacích"
codex --profile architektura "navrhni databázový model pro payments"
```

---

## Jak funguje detekce

Wrapper hledá klíčová slova v promptu:

| Klíčová slova (příklady) | Effort | Model |
|---|---|---|
| přejmenuj, překlep, změň text, komentář | low | gpt-5.4-mini |
| implementuj, přidej, vytvoř, test, formulář | medium | gpt-5.4 |
| debug, nefunguje, security, migrace, review | high | gpt-5.4 |
| architektura, celý modul, bezpečnostní audit, race condition | xhigh | gpt-5.4 |

**Sekundární signal:** Prompt delší než 50 slov automaticky zvýší effort o stupeň.

---

## Přímé použití profilů (bez wrapperu)

```bash
codex --profile rychly      # gpt-5.4-mini, low
codex --profile standard    # gpt-5.4, medium (default)
codex --profile hluboky     # gpt-5.4, high
codex --profile architektura # gpt-5.4, xhigh
```

---

## Kdy použít co ručně

| Situace | Příkaz |
|---|---|
| Přejmenování, malé UI úpravy | `codex --profile rychly` |
| Běžná implementace feature | `cx` (auto detekce) nebo `codex` |
| Debug záhadného bugu | `codex --profile hluboky` |
| Security audit před deployem | `codex --profile hluboky` |
| Návrh architektury | `codex --profile architektura` |
| DB migrace | `codex --profile hluboky` |

---

## Poznámky

- `xhigh` spotřebuje 3–5× více tokenů než `medium` – používej jen na těžké úkoly
- `gpt-5.4-mini` je ~3× levnější a rychlejší – ideální na rutinní věci
- Profily jsou definovány v `.codex/config.toml`
- Subagenti (explorer, security-auditor atd.) mají svůj reasoning nastavený pevně
