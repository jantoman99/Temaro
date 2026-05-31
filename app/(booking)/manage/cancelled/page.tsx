export default function ManageBookingCancelledPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 sm:py-14">
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-2xl items-center">
        <section className="w-full overflow-hidden rounded-lg border border-border bg-card text-center shadow-sm">
          <div className="bg-card px-6 py-10 sm:px-10">
            <div className="mx-auto grid size-16 place-items-center rounded-lg border border-success/25 bg-success/10 text-3xl shadow-sm">
              ✓
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Rezervace zrušena
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Termín byl zrušen
            </h1>
            <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-muted-foreground">
              Rezervace byla úspěšně zrušena. Pokud chcete nový termín, kontaktujte podnik nebo použijte jeho booking stránku znovu.
            </p>
          </div>
          <div className="border-t border-border bg-background/60 px-6 py-4 text-sm text-muted-foreground">
            Tuto stránku můžete bezpečně zavřít.
          </div>
        </section>
      </div>
    </main>
  );
}
