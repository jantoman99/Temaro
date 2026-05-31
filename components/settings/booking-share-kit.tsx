import { getBaseAppUrl } from "@/lib/app-url";
import { getBookingShareKit } from "@/lib/booking/share-kit";

export function BookingShareKit({
  businessName,
  slug,
}: {
  businessName: string;
  slug: string;
}) {
  const bookingUrl = `${getBaseAppUrl()}/${slug}`;
  const shareKit = getBookingShareKit({ bookingUrl, businessName });

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Sdílení</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Instagram, Google profil a QR</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          Hotové texty a měřitelné odkazy pro bio, Google Business Profile, story nebo cedulku v provozovně.
        </p>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="grid gap-3">
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Instagram bio</span>
            <textarea
              readOnly
              rows={2}
              value={shareKit.instagramBio}
              className="resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Story / příspěvek</span>
            <textarea
              readOnly
              rows={4}
              value={shareKit.instagramStory}
              className="resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none"
            />
          </label>
          <p className="break-all rounded-md border border-border bg-muted/35 px-3 py-2 text-sm font-semibold text-muted-foreground">
            {bookingUrl}
          </p>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Google Business Profile booking CTA</span>
            <textarea
              readOnly
              rows={3}
              value={shareKit.googleBusinessProfileUrl}
              className="resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none"
            />
          </label>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={`QR kód pro ${businessName}`} className="mx-auto size-40 rounded-lg border border-border bg-white p-2" src={shareKit.qrImageUrl} />
          <a
            href={shareKit.qrImageUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Otevřít QR kód
          </a>
        </div>
      </div>
    </section>
  );
}
