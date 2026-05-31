"use client";

import { useActionState } from "react";

import { importCsvAction } from "@/app/(dashboard)/import/actions";
import { Button } from "@/components/ui/button";

const initialState = {
  error: "",
  preview: [],
  success: "",
};

const inputClassName =
  "rounded-md border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-semibold file:text-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

const textareaClassName =
  "min-h-48 rounded-md border border-input bg-background px-3 py-2.5 font-mono text-xs font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

const sampleClientsCsv = `jmeno;telefon;email;poznamky
Petr Svoboda;+420777123456;petr@example.cz;Preferuje dopoledne
Eva Novakova;+420777999888;eva@example.cz;`;

const sampleServicesCsv = `nazev;delka;cena;mena;buffer;popis;zaloha_typ;zaloha
Pansky strih;45;450;CZK;0;Klasicky strih;none;
Barveni;120;1800;CZK;15;Barveni vlasu;percent;30`;

const sampleBookingsCsv = `klient;telefon;email;sluzba;zamestnanec;datum;cas;poznamky
Petr Svoboda;+420777123456;petr@example.cz;Pansky strih;Anna Novakova;2026-06-10;10:00;Import z puvodniho systemu`;

function StatusBadge({ status }: { status: "valid" | "invalid" | "duplicate" }) {
  const label = status === "valid" ? "OK" : status === "duplicate" ? "Duplicita" : "Chyba";
  const className = status === "valid"
    ? "bg-success/10 text-success"
    : status === "duplicate"
      ? "bg-warning/10 text-amber-800 dark:text-warning"
      : "bg-destructive/10 text-destructive";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>{label}</span>;
}

export function CsvImportForm() {
  const [state, formAction, isPending] = useActionState(importCsvAction, initialState);

  return (
    <form action={formAction} className="grid gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">CSV import</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Klienti a služby</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          Nejprve spusťte dry-run. Ostrý import vytvoří jen validní nové řádky a duplicitní kontakty nebo služby přeskočí.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Typ importu
              <select name="importType" defaultValue="clients" className={inputClassName}>
                <option value="clients">Klienti</option>
                <option value="services">Služby</option>
                <option value="bookings">Rezervace</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              CSV soubor
              <input name="csvFile" type="file" accept=".csv,text/csv" className={inputClassName} />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-semibold">
            Nebo vložte CSV text
            <textarea
              name="csvText"
              placeholder="Vložte CSV s hlavičkou..."
              className={textareaClassName}
            />
          </label>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/35 p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input name="dryRun" type="checkbox" value="true" defaultChecked className="size-4 accent-primary" />
              Jen zkontrolovat, zatím neimportovat
            </label>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Zpracovávám..." : "Spustit import"}
            </Button>
          </div>
        </div>

        <aside className="rounded-xl border border-border bg-background p-4 text-sm">
          <p className="font-semibold">Podporované hlavičky</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Klienti</p>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">{sampleClientsCsv}</pre>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Služby</p>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">{sampleServicesCsv}</pre>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Rezervace</p>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">{sampleBookingsCsv}</pre>
        </aside>
      </div>

      {state.error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl border border-success/30 bg-success/10 p-3 text-sm font-semibold text-success">
          {state.success}
        </p>
      ) : null}

      {state.summary ? (
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Validní</p>
            <p className="mt-1 text-2xl font-semibold">{state.summary.validRows}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Importováno</p>
            <p className="mt-1 text-2xl font-semibold">{state.summary.importedRows}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Duplicity</p>
            <p className="mt-1 text-2xl font-semibold">{state.summary.duplicateRows}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Chyby</p>
            <p className="mt-1 text-2xl font-semibold">{state.summary.invalidRows}</p>
          </div>
        </div>
      ) : null}

      {state.preview && state.preview.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b border-border bg-muted/45 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Řádek</th>
                <th className="px-4 py-3 font-semibold">Název</th>
                <th className="px-4 py-3 font-semibold">Stav</th>
                <th className="px-4 py-3 font-semibold">Poznámka</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {state.preview.map((row) => (
                <tr key={`${row.rowNumber}-${row.label}`}>
                  <td className="px-4 py-3 font-semibold">{row.rowNumber}</td>
                  <td className="px-4 py-3 font-medium">{row.label}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{row.errors.join(" ") || "Připraveno k importu."}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </form>
  );
}
