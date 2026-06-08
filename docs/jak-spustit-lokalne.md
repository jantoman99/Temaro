# Jak spustit web lokalne

## Nejjednodussi varianta na Windows

1. Dvojklik na soubor `scripts/start-localhost.bat`.
2. Pockej, az se v okne objevi, ze server bezi.
3. Otevri v prohlizeci:

```text
http://localhost:3000
```

## Varianta pres terminal

```bash
npm install
npm run dev
```

## Kontrola pred nasazenim

```bash
npm run type-check
npm run lint
npm run build
```

Bez Supabase env promennych web bezi v demo rezimu. Pro realny test je potreba doplnit `.env.local` a aplikovat Supabase migrace.

## Co kliknout ve webu

- `Demo` nebo booking ukázka = veřejný booking flow klienta.
- `Přihlášení` / `Začít zdarma` = vstup do auth části.

## Jak web vypnout

Zavri okno se spustenym serverem nebo v nem stiskni `Ctrl+C`.
