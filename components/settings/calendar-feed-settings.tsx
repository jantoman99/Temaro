"use client";

import { useActionState, useState } from "react";

import { createCalendarFeedAction, revokeCalendarFeedAction } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { formatDateTimeForDisplay } from "@/lib/date-format";
import type { Database } from "@/types/database";

type CalendarFeedToken = Pick<
  Database["public"]["Tables"]["calendar_feed_tokens"]["Row"],
  "created_at" | "id" | "last_used_at" | "name"
>;

const initialState = {
  error: "",
  feedUrl: "",
  success: "",
};

function CopyFeedUrl({ feedUrl }: { feedUrl: string }) {
  const [copyState, setCopyState] = useState("");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopyState("Zkopírováno");
    } catch {
      setCopyState("Kopírování se nepodařilo");
    }
  }

  return (
    <div className="rounded-lg border border-success/25 bg-success/10 p-3">
      <p className="text-sm font-semibold text-success">Nový iCal odkaz</p>
      <p className="mt-2 break-all rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm">{feedUrl}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          Zkopírovat odkaz
        </Button>
        {copyState ? <span className="text-sm font-medium text-muted-foreground">{copyState}</span> : null}
      </div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">
        Odkaz se z bezpečnostních důvodů ukáže jen teď. Pokud ho ztratíte, vygenerujte nový a starý zrušte.
      </p>
    </div>
  );
}

function RevokeFeedForm({ feed }: { feed: CalendarFeedToken }) {
  const [state, formAction, isPending] = useActionState(revokeCalendarFeedAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <input type="hidden" name="feedId" value={feed.id} />
      <div>
        <p className="text-sm font-semibold">{feed.name}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          Vytvořeno {formatDateTimeForDisplay(feed.created_at)}
          {feed.last_used_at ? ` · poslední použití ${formatDateTimeForDisplay(feed.last_used_at)}` : " · zatím nepoužito"}
        </p>
        {state.error ? <p className="mt-2 text-xs font-semibold text-destructive">{state.error}</p> : null}
        {state.success ? <p className="mt-2 text-xs font-semibold text-success">{state.success}</p> : null}
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? "Ruším..." : "Zrušit feed"}
      </Button>
    </form>
  );
}

export function CalendarFeedSettings({
  feeds,
  isDemo = false,
}: {
  feeds: CalendarFeedToken[];
  isDemo?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(createCalendarFeedAction, initialState);

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">iCal export</p>
          <h2 className="mt-2 text-lg font-semibold">Externí kalendář</h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
            Read-only odkaz pro Apple Calendar, Google Calendar nebo Outlook. Feed ukazuje aktivní rezervace a nejde přes něj nic měnit.
          </p>
        </div>
        <form action={formAction}>
          <Button type="submit" disabled={isPending || isDemo}>
            {isPending ? "Generuji..." : "Vygenerovat iCal odkaz"}
          </Button>
        </form>
      </div>

      <div className="mt-4 grid gap-3">
        {state.feedUrl ? <CopyFeedUrl feedUrl={state.feedUrl} /> : null}
        {state.error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{state.error}</p> : null}
        {state.success && !state.feedUrl ? <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm font-medium text-success">{state.success}</p> : null}
        {feeds.length > 0 ? feeds.map((feed) => <RevokeFeedForm key={feed.id} feed={feed} />) : (
          <div className="rounded-lg border border-dashed border-border bg-secondary p-4 text-sm font-medium text-muted-foreground">
            Zatím není vytvořený žádný aktivní iCal feed.
          </div>
        )}
      </div>
    </section>
  );
}
