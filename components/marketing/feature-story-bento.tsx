import { Bell, CalendarDays, CreditCard, Globe2, QrCode, Smartphone, UsersRound } from "lucide-react";

const sourceItems = ["Web", "Instagram", "QR", "Google"] as const;

const flowSteps = [
  {
    icon: Globe2,
    label: "Zdroj",
    title: "Instagram termín padá rovnou do kalendáře.",
    text: "Temaro drží původ rezervace u termínu, aby recepce viděla, odkud klient přišel.",
    status: "16:00 · Lucie · 90 min",
  },
  {
    icon: CalendarDays,
    label: "Kalendář",
    title: "Volné místo je vidět vedle obsazeného dne.",
    text: "Tým neřeší tabulku bokem. Vidí člověka, službu, délku i kolizi přímo v rozvrhu.",
    status: "Dostupnost ověřena",
  },
  {
    icon: UsersRound,
    label: "Klient",
    title: "Klientská karta ukáže kontext před potvrzením.",
    text: "Historie, preference a no-show signály nejsou schované v poznámkách mimo rezervaci.",
    status: "2 no-show signály",
  },
  {
    icon: Bell,
    label: "Zpráva",
    title: "SMS připomínka připravena bez ruční zprávy.",
    text: "U rizikovějších termínů může tým rovnou vidět další krok místo dalšího telefonátu.",
    status: "Zítra 10:30",
  },
  {
    icon: CreditCard,
    label: "Platba",
    title: "300 Kč záloha připravena u rizikového termínu.",
    text: "Záloha je navázaná na konkrétní rezervaci, ne jako oddělená platba bez souvislosti.",
    status: "Další krok jasný",
  },
] as const;

const flowStatusItems = [
  ["Vlastní kanál", "Web, Instagram, Google a QR bez marketplace provize."],
  ["Provozní kontext", "Služba, člověk, klient a platba zůstávají u jednoho termínu."],
  ["Méně ruční práce", "Recepce vidí další krok dřív, než začne dohledávat zprávy."],
] as const;

export function FeatureStoryBento() {
  return (
    <section id="produktovy-pribeh" className="temaro-feature-bento px-4 py-18 sm:px-6 sm:py-22 lg:px-8" aria-label="Produktový příběh rezervace">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="section-eyebrow">Produkt v provozu</p>
            <h2 className="font-display mt-3 text-balance text-5xl font-semibold leading-[0.96] sm:text-6xl">
              Jedna rezervace projde celým provozem.
            </h2>
          </div>
          <p className="max-w-2xl text-lg font-semibold leading-8 text-[var(--ink-soft)]">
            Zdroj rezervace, týmový kalendář, klientská paměť, SMS a záloha nejsou oddělené funkce.
            Jsou to kroky jednoho dne.
          </p>
        </div>

        <div className="temaro-reservation-flow mt-10">
          <article className="temaro-flow-board">
            <div className="temaro-flow-board-head">
              <span>Živý průchod rezervace</span>
              <strong>16:00</strong>
            </div>
            <h3>Zdroj → kalendář → klient → zpráva → platba</h3>
            <p>
              Stejný termín nese původ rezervace, kapacitu týmu, klientský kontext,
              připomínku i zálohu. Proto stránka působí jako produkt, ne katalog funkcí.
            </p>
            <div className="temaro-flow-source-row" aria-label="Vstupní kanály rezervace">
              {sourceItems.map((item, index) => (
                <span key={item} style={{ animationDelay: `${index * 130}ms` }}>
                  {item}
                </span>
              ))}
            </div>
            <div className="temaro-flow-booking-card">
              <small>Nová rezervace</small>
              <strong><span>Barva</span>{" "}<span>a foukaná</span></strong>
              <span>Lucie · 90 min · Instagram</span>
              <div>
                <Smartphone className="size-4" strokeWidth={2} />
                <span>SMS připomínka připravena</span>
              </div>
              <div>
                <QrCode className="size-4" strokeWidth={2} />
                <span>300 Kč záloha připravena</span>
              </div>
            </div>
          </article>

          <div className="temaro-flow-rail" aria-label="Kroky jedné rezervace">
            {flowSteps.map(({ icon: Icon, label, title, text, status }, index) => (
              <article key={label} className="temaro-flow-step">
                <div className="temaro-flow-step-head">
                  <span><Icon className="size-4" strokeWidth={1.9} /> {label}</span>
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className={label === "Klient" ? "temaro-flow-status risk" : "temaro-flow-status"}>{status}</div>
              </article>
            ))}
          </div>
        </div>

        <div className="temaro-flow-status-grid mt-4" aria-label="Co produkt drží pohromadě">
          {flowStatusItems.map(([label, text]) => (
            <article key={label}>
              <strong>{label}</strong>
              <span>{text}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
