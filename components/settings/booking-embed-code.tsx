import { getBaseAppUrl } from "@/lib/app-url";
import { getBookingButtonEmbedCode, getBookingIframeEmbedCode } from "@/lib/booking/embed";

export function BookingEmbedCode({
  brandColor,
  slug,
}: {
  brandColor?: string | null;
  slug: string;
}) {
  const embedCode = getBookingButtonEmbedCode({
    appUrl: getBaseAppUrl(),
    brandColor,
    slug,
  });
  const iframeEmbedCode = getBookingIframeEmbedCode({
    appUrl: getBaseAppUrl(),
    slug,
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Widget na web</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Rezervační widget</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          Vložte do webu buď celé rezervační okno, nebo jednodušší tlačítko. Obě varianty používají jen veřejný slug, bez tenant ID v query stringu.
        </p>
      </div>
      <label htmlFor="bookingIframeEmbed" className="mt-4 block text-sm font-semibold">
        Celý iframe widget
      </label>
      <textarea
        id="bookingIframeEmbed"
        readOnly
        rows={4}
        value={iframeEmbedCode}
        className="mt-2 w-full resize-none rounded-md border border-input bg-background px-3 py-2.5 font-mono text-xs font-medium text-foreground outline-none"
      />
      <label htmlFor="bookingButtonEmbed" className="mt-4 block text-sm font-semibold">
        Jednoduché tlačítko
      </label>
      <textarea
        id="bookingButtonEmbed"
        readOnly
        rows={4}
        value={embedCode}
        className="mt-2 w-full resize-none rounded-md border border-input bg-background px-3 py-2.5 font-mono text-xs font-medium text-foreground outline-none"
      />
      <div className="mt-4 rounded-xl border border-border bg-muted/35 p-4">
        <p className="text-sm font-semibold">Náhled tlačítka</p>
        <a
          href={`/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white shadow-sm"
          style={{ backgroundColor: brandColor ?? "#635BFF" }}
        >
          Rezervovat termín
        </a>
      </div>
    </section>
  );
}
