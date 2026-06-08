# Roadmap

Aktualizováno: 2026-06-08 19:11 CEST

Roadmapa je operativní zdroj pravdy pro další práci. Detailní historické analýzy jsou v `docs/14-market-analysis-booking-systems.md`, `docs/19-product-differentiation-and-gap-plan.md`, `docs/20-competitive-analysis-booking-systems-2026.md` a `docs/21-frontend-competition-auth-analysis.md`.

## Aktuální fáze

Temaro je ve fázi MVP/pre-launch. Produkt už má široké jádro i první vrstvy pokročilých modulů, ale před pilotem je důležitější ověřit reálné provozní flow než přidávat další rozsah.

Primární segment pro další práci: hair/beauty/wellness.

## Now

1. Projít produkční runtime smoke s reálnými env podle `docs/runtime-checklist.md`: registrace, onboarding `/start`, služby, tým, veřejná booking stránka, rezervace, e-mail, kalendář, self-service manage a platby.
2. Zlepšit veřejný dojem podle `docs/21-frontend-competition-auth-analysis.md`: dropdown navigace, konkrétnější homepage, `Jak to funguje`, booking kanály a demo/video CTA.
3. Ověřit veřejný dojem po zveřejnění repa: GitHub README, live demo, homepage, `/demo-barber`, `/podniky`, hlavní CTA a mobilní chování.
4. Doplnit produkční rate limit přes Upstash; `/api/health` zatím může hlásit `rate_limit.configured=false`.
5. Vybrat konkrétní SMS providera, pricing a produkční env pro SMS reminder flow.
6. Připravit pilotní scénář pro první reálnou provozovnu: co nastaví, co otestuje, jak se vrátí zpětná vazba a co je mimo pilot.

## Next

1. Google/Outlook calendar sync. To je největší chybějící konkurenční funkce proti běžným rezervačním systémům.
2. Google OAuth runtime aktivace až po finální produkční doméně a správném Supabase/Google nastavení.
3. Apple login pro zákaznický účet; Microsoft login řešit až spolu s Outlook syncem, Facebook login zatím ne.
4. Supabase Pro/leaked password protection, Cloudflare/WAF a finální auth redirect allowlist před reálným pilotem.
5. Lepší lokální hledání a mapová vrstva v `/podniky`; katalog má zůstat bez provizního marketplace modelu.
6. Rozšířit E2E o přihlášený mutační smoke v izolovaném test tenantovi pro onboarding, služby, tým, booking-page a admin rezervaci.
7. Zpřesnit pricing a pilotní nabídku podle `docs/business-model.md`.

## Later

1. Push notifikace pro PWA jako další kanál po e-mailu a SMS.
2. Automatické chování nad prvními evidenčními vrstvami: Last Minute odesílání, empty-slot recovery rozesílky, automatické trusted/risk skórování.
3. Cashflow/payroll/reporting vrstva nad platbami a provizemi.
4. Provozní doporučení: návrh záloh, vyplnění volných míst, potvrzení rizikového klienta nebo nejlepší zdroj rezervací podle dat.
5. Další segmentové landingy rozšiřovat podle reálné aktivace, ne podle obecného SEO dojmu.

## Nedělat Teď

1. Provizní marketplace, který bere provizi z vlastních klientů podniku.
2. AI funkce bez konkrétního bezpečného provozního workflow.
3. Další velké moduly bez ručního otestování existujícího produktu.
4. Velký redesign veřejného webu najednou; UI změny dělat po menších blocích a ověřovat screenshot/browser smoke před pushem.
5. Rozšiřovat focus mimo hair/beauty/wellness, dokud není ověřený pilotní flow.
