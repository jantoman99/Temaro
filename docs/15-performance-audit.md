# 15 – Performance audit landing page

Datum: 2026-05-01 22:54 CEST  
Rozsah: root landing page `http://localhost:3000/` po poslední landing/design vrstvě  
Prostredi: lokalni produkcni build pres `npm run build` + `npm run start`, Lighthouse spusteny pres Windows `npx lighthouse`.

## Vysledky

| Profil | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Payload |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Desktop | 100 | 96 | 100 | 100 | 0.4 s | 0.7 s | 0 ms | 0 | 349 KiB |
| Mobile | 93 | 96 | 100 | 100 | 1.4 s | 3.1 s | 10 ms | 0 | 347 KiB |

## Interpretace

- Desktop je bez problemu: LCP je hluboko pod 2.5 s, zadny blocking time, zadny layout shift.
- Mobile je pouzitelny a celkove silny, ale LCP 3.1 s je nad cilovou hranici 2.5 s.
- Lighthouse jako LCP element na mobilu oznacil hero H1 `Méně telefonátů. Klidnější provoz.`
- Pokusy o odlozeni `InteractiveProductDemo` pres skeleton LCP nezlepsily a zhorsily product-as-proof dojem, proto byly vraceny.
- Pokus o mobile-only system font snizil FCP, ale zhorsil Speed Index/LCP, proto byl vracen.
- Aplikovano zustalo jen to, co dava smysl bez negativniho UX dopadu: mobile vypnuti `motion-reveal`, jednodussi mobile hero background, vypnuti dekorativniho dot patternu v demo shellu na mobilu a slabsi backdrop blur mimo desktop.
- Lighthouse ve Windows nekdy konci chybou `EPERM` pri mazani temp slozky, ale JSON report se predtim korektne zapise. Metriky vyse jsou z uspesne zapsanych reportu.

## Dalsi optimalizace

- Pokud bude mobile LCP priorita, resit ji az po rucnem prokliku realneho mobilu. Aktualni hodnota muze byt ovlivnena lokalnim Windows/WSL prostredim.
- Nejpravdepodobnejsi dalsi smer je zmensit mobile hero H1 nebo zkratit above-fold obsah, ne lazy-loadovat produktove demo.
- Neodkladat hero demo, dokud neni jasne, ze realny mobilni test potvrzuje LCP problem. Pro landing je product-as-proof dulezitejsi nez slepa optimalizace synteticke metriky.
