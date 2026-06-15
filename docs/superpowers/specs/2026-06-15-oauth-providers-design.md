# OAuth Providers Design

Datum: 2026-06-15

## Cíl

Temaro má podporovat přihlášení a registraci přes Google, Facebook a Apple pro podnikatelské účty i zákaznický účet.

## Rozsah

- Podnikatelská registrace `/register`: e-mail/heslo zůstává fallback; OAuth tlačítka vytvoří podnik až po úspěšném callbacku.
- Podnikatelské přihlášení `/login`: OAuth tlačítka přihlásí existujícího owner/staff uživatele a callback ověří tenant/role.
- Zákaznický účet `/account/login`: OAuth tlačítka přihlásí zákazníka na `/account` bez tenant metadata a bez vytvoření podniku.
- Podporované OAuth providery: `google`, `facebook`, `apple`.

## Architektura

Auth actions dostanou jeden sdílený helper `redirectToOAuth(provider, nextPath)`. Provider je whitelistovaný typem i runtime konstantou, takže formulář ani budoucí refaktor nemůže poslat libovolný provider string do Supabase.

Callback `/auth/callback` zůstává společný. Pokud uživatel po OAuth nemá `tenant_id`, callback vytvoří podnik jen tehdy, když existuje serverová `temaro_oauth_business_registration` cookie s validovaným názvem podniku a jménem vlastníka. Zákaznický OAuth login používá `next=/account`, takže účet bez tenant metadata callback pustí pouze do zákaznických rout.

## Bezpečnost

- `tenant_id` nikdy nepřichází z URL, body ani query.
- `next` se dál čistí přes `getSafeRedirectPath`.
- Business OAuth registrace vyžaduje Supabase service role env a pending registrační cookie.
- Runtime OAuth provider setup zůstává mimo repo: Supabase musí mít zapnuté Google, Facebook a Apple providery a správné callback URL.

## Testy

- Unit testy musí prokázat, že business/customer actions volají Supabase OAuth s providery `google`, `facebook`, `apple`.
- UI/E2E smoke musí vidět Google, Facebook a Apple entrypointy na `/account/login`.
- Stávající callback testy pro business registration a customer account musí zůstat zelené.
