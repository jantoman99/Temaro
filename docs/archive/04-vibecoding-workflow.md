# Vibecoding workflow 2026

## Stav trhu

- 92 % US vývojářů používá AI coding nástroje denně
- 41–60 % veškerého nového kódu je AI-generovaného
- Trh AI coding nástrojů: $4.7–8.5 miliard v 2026

## Kategorie nástrojů

### App Buildery (pro ne-vývojáře / rychlé prototypy)
Ideální pokud nechceš sahat na kód vůbec.

| Nástroj | Pro | Proti |
|---|---|---|
| **Lovable** | Krásné UI, Next.js + Supabase | Méně kontroly |
| **Bolt.new** | Rychlý fullstack v browseru | Může být drahé při větším projektu |
| **Replit Agent** | Zero setup, deployment v jednom | Méně kontroly nad prostředím |

### AI Code Editory (pro vývojáře / vibecoding s kontrolou)
Ideální pokud chceš mít kód pod kontrolou a pracovat v IDE.

| Nástroj | Pro | Proti |
|---|---|---|
| **Cursor** | Nejlepší multi-file agent (Composer), VS Code fork | $20/měs, resource intensive |
| **Windsurf** | Rychlejší, $15/měs, deep context (Cascade) | Menší ekosystém |
| **GitHub Copilot** | Zero security issues, GitHub integrace | Konzervativnější generování |
| **Claude Code** | Terminálový agent, složité úkoly | Pro zkušenější vývojáře |

## Doporučení pro tento projekt

**Cursor nebo Windsurf** = nejlepší volba pro SaaS vibecoding.

- Cursor: pokud chceš maximální autonomii agenta
- Windsurf: pokud chceš rychlost a nižší cenu ($15 vs $20)

## Nejefektivnější workflow 2026

### 1. Začni s boilerplatem
Nepiš od nuly. Supastarter nebo Makerkit ti dají
auth, multi-tenancy, billing hotové za pár minut.

### 2. Piš spec před kódem
Před každou session napiš AI co chceš:
```
Chci vytvořit feature X.
- Uživatel udělá A
- Systém udělá B
- Ověřit tenant_id z JWT
- Validovat vstup Zodem
- Edge cases: ...
```

### 3. Malé kroky, ne velké skoky
❌ "Vytvoř mi celý booking systém"
✅ "Vytvoř databázový model pro booking"
✅ "Přidej API endpoint pro vytvoření rezervace"
✅ "Přidej validaci a tenant izolaci"

### 4. Bezpečnostní prompt template
Vždy přidej k API endpointům:
```
- Ověř JWT token
- tenant_id bere z tokenu, NIKDY z request body
- Filtruj všechna DB data podle tenant_id
- Přidej Zod validaci vstupů
- Přidej kontrolu rolí (owner/staff)
```

### 5. Review každého endpointu
AI generuje rychle ale dělá chyby v:
- IDOR (chybějící tenant check)
- Race conditions (dva lidé stejný slot)
- Timezone handling

### 6. Testy piš hned
```
"Napiš testy pro tento endpoint, 
 otestuj: happy path, chybný tenant, 
 neplatný input, neexistující záznam"
```

## Rizika vibecoding (co sledovat)

- AI-generovaný kód má 2.74x více security vulnerabilit
- 36 % vibe coderů přeskakuje QA úplně
- Technický dluh roste rychle bez architektury
- Race conditions a timezone bugy AI často opomíjí

## Zlaté pravidlo

> Vibe coding je force multiplier, ne náhrada za přemýšlení.
> AI píše kód, ty řídíš architekturu a bezpečnost.
