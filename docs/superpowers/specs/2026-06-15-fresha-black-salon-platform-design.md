# Fresha Black Salon Platform Design

## Goal

Posunout Temaro root landing z čistého, ale stále generického SaaS mockupu do výraznější platformové prezentace inspirované Fresha: černá/bílá jako základ, větší a jistější navigace, kompaktnější hero, více reálných fotek provozů a produktový důkaz výš ve first foldu.

## Art Direction

Creative territory: `black salon platform`.

Signature move: salon photo wall a produktový kalendář se překrývají v jednom hero objektu. Návštěvník má během prvních sekund vidět, že Temaro není jen kalendářová tabulka, ale systém pro reálné salony, barbery, beauty a wellness provozy.

## Requirements

- Header opticky zesílit vůči hero: větší topbar, černé CTA, méně pastelový/pill SaaS dojem.
- Hero zmenšit typograficky a přestavět z centrovaného billboardu na split kompozici: copy vlevo, produkt + fotky vpravo.
- Přidat fotky salonů přímo do hero přes existující lokální assety v `public/marketing/premium` a `public/marketing/industries`.
- Zachovat code-native produktový důkaz kalendáře, ale zmenšit device výšku tak, aby se první fold rychleji dostal k proofu.
- Nezavádět fake ratingy, fake počty zákazníků ani cizí Fresha assety.
- Ověřit desktop i mobile screenshots proti dev URL a nulový horizontální overflow.

## Non-goals

- Dashboard redesign.
- Backend/runtime změny.
- Nové obchodní claims bez reálného podkladu.
