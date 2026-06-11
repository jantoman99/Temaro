# Landing Dispatch Direction Design

## Problem
Landing ma produktove prvky, ale pusobi jako sled panelu. Navstevnik si ma zapamatovat jednu vec: Temaro meni chaoticky den v citelny provozni plan.

## Direction
Art direction: provozni dispecink dne. Zachovat Temaro system: porcelain/cobalt/apricot/mint/ink, Bricolage display, Instrument Sans body, IBM Plex Mono pro casy. Signature prvek je `day rail`: jedna casova osa, ktera zacina v hero widgetu, pokracuje pres engine/foto dukazy a vraci se v workflow a produktove ukazce.

## Scope
- Zesilit hero jako hlavni product proof: viditelne kroky dne, obsazeno/volno/riziko/potvrzeno, lepsi mobile compact rail.
- Zmenit trust bar z filler marquee na staticky provozni proof strip s konkretnimi tvrzenimi.
- Napojit casovy engine a workflow na stejnou rail metaforu.
- Omezit dojem generickych rounded cards pomoci kontrastu, rails a status stripu.
- Opravit Next image quality warning pro `quality={70}`.

## Out Of Scope
- Backend, auth, tenant izolace, databaze a API endpointy.
- Nove marketing claims bez opory v produktu.
- Radikalni zmena palety nebo dark SaaS smer.

## Testing
- Rozsirit `tests/landing-polish.test.ts` o guardy pro dispatch direction, mobile rail a Next image quality.
- Spustit relevantni Vitest test.
- Po implementaci spustit `npm run check`.
