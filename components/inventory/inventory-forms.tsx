"use client";

import { useActionState } from "react";

import {
  createInventoryProductAction,
  recordInventoryMovementAction,
} from "@/app/(dashboard)/inventory/actions";
import { Button } from "@/components/ui/button";

type InventoryProductOption = {
  id: string;
  name: string;
  stock_quantity: number;
  unit: string;
};

const movementReasons = [
  { label: "Nákup / příjem", value: "purchase" },
  { label: "Spotřeba", value: "usage" },
  { label: "Prodej", value: "sale" },
  { label: "Korekce", value: "adjustment" },
  { label: "Odpis", value: "waste" },
  { label: "Vratka", value: "return" },
] as const;

function ActionMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) {
    return null;
  }

  return (
    <p className={error ? "text-sm font-semibold text-destructive" : "text-sm font-semibold text-success"}>
      {error ?? success}
    </p>
  );
}

export function InventoryProductForm() {
  const [state, action, pending] = useActionState(createInventoryProductAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Nový produkt</p>
        <p className="mt-1 text-sm text-muted-foreground">Základ pro prodej i spotřebu materiálu.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Název
        <input name="name" required maxLength={120} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          SKU
          <input name="sku" maxLength={80} className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Jednotka
          <input name="unit" defaultValue="ks" required maxLength={24} className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Počáteční sklad
          <input name="stockQuantity" inputMode="numeric" defaultValue="0" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Nízký stav od
          <input name="lowStockThreshold" inputMode="numeric" defaultValue="0" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold">
          Nákupní cena
          <input name="purchasePrice" inputMode="decimal" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Prodejní cena
          <input name="retailPrice" inputMode="decimal" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Měna
          <select name="currency" defaultValue="CZK" className="rounded-md border border-input bg-background px-3 py-2">
            <option value="CZK">CZK</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
      </div>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending}>
        {pending ? "Ukládám..." : "Přidat produkt"}
      </Button>
    </form>
  );
}

export function InventoryMovementForm({ products }: { products: InventoryProductOption[] }) {
  const [state, action, pending] = useActionState(recordInventoryMovementAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Skladový pohyb</p>
        <p className="mt-1 text-sm text-muted-foreground">Příjem zadávejte kladně, spotřebu/prodej záporně.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Produkt
        <select name="productId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte produkt</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} · {product.stock_quantity} {product.unit}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Důvod
          <select name="reason" defaultValue="usage" className="rounded-md border border-input bg-background px-3 py-2">
            {movementReasons.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Množství
          <input name="quantityDelta" required inputMode="numeric" placeholder="-1" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Poznámka
        <textarea name="note" rows={3} maxLength={500} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending || products.length === 0}>
        {pending ? "Ukládám..." : "Zaevidovat pohyb"}
      </Button>
    </form>
  );
}
