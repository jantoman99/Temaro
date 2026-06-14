import { Bell, CalendarDays, CreditCard, Globe2, QrCode, Smartphone, UsersRound } from "lucide-react";

const sourceItems = ["Web", "Instagram", "QR", "Google"] as const;

export function FeatureStoryBento() {
  return (
    <section id="produktovy-pribeh" className="temaro-feature-bento px-4 py-18 sm:px-6 sm:py-22 lg:px-8" aria-label="Produktový příběh rezervace">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
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

        <div className="temaro-bento-grid mt-10">
          <article className="temaro-bento-card temaro-bento-live">
            <div className="temaro-bento-card-head">
              <span><Globe2 className="size-4" /> Zdroj rezervace</span>
              <strong>16:00</strong>
            </div>
            <h3>Instagram termín padá rovnou do kalendáře.</h3>
            <div className="temaro-bento-source-flow" aria-hidden="true">
              {sourceItems.map((item, index) => (
                <span key={item} style={{ animationDelay: `${index * 130}ms` }}>
                  {item}
                </span>
              ))}
            </div>
            <div className="temaro-bento-booking-card">
              <small>Nová rezervace</small>
              <strong><span>Barva</span>{" "}<span>a foukaná</span></strong>
              <span>Lucie · 90 min · Instagram</span>
            </div>
          </article>

          <article className="temaro-bento-card temaro-bento-calendar">
            <div className="temaro-bento-card-head">
              <span><CalendarDays className="size-4" /> Týmový kalendář</span>
            </div>
            <div className="temaro-bento-day">
              <span className="apricot">08:30 Střih</span>
              <span className="mint">10:30 Barva</span>
              <span className="blue">12:15 Kosmetika</span>
              <span className="ink">16:00 Nová rezervace</span>
            </div>
          </article>

          <article className="temaro-bento-card temaro-bento-client">
            <div className="temaro-bento-card-head">
              <span><UsersRound className="size-4" /> Klientská karta</span>
            </div>
            <h3>Recepce vidí kontext před potvrzením.</h3>
            <div className="temaro-bento-client-list">
              <span>poslední návštěva 12. 6.</span>
              <span>preferuje dopoledne</span>
              <span className="risk">2 no-show signály</span>
            </div>
          </article>

          <article className="temaro-bento-card temaro-bento-reminder">
            <div className="temaro-bento-card-head">
              <span><Bell className="size-4" /> SMS připomínka</span>
              <Smartphone className="size-5 text-[var(--cobalt)]" />
            </div>
            <h3>Připomínka je připravená bez ruční zprávy.</h3>
            <div className="temaro-bento-message">
              <span>Zítra 10:30 · Barva a foukaná</span>
              <strong>SMS připomínka připravena</strong>
            </div>
          </article>

          <article className="temaro-bento-card temaro-bento-deposit">
            <div className="temaro-bento-card-head">
              <span><CreditCard className="size-4" /> Záloha</span>
              <QrCode className="size-5 text-[var(--ink)]" />
            </div>
            <h3>Rizikový termín má jasný další krok.</h3>
            <div className="temaro-bento-deposit-pill">300 Kč záloha připravena</div>
          </article>
        </div>
      </div>
    </section>
  );
}
