import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { InventoryMovementForm, InventoryProductForm } from "@/components/inventory/inventory-forms";
import { PageHeader } from "@/components/layouts/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type InventoryProduct = {
  id: string;
  currency: string;
  is_active: boolean;
  low_stock_threshold: number;
  name: string;
  purchase_price: number | null;
  retail_price: number | null;
  sku: string | null;
  stock_quantity: number;
  unit: string;
  updated_at: string;
};

type InventoryMovement = {
  id: string;
  created_at: string;
  quantity_delta: number;
  reason: string;
  note: string | null;
  inventory_products: { name: string | null; unit: string | null } | null;
};

const reasonLabels: Record<string, string> = {
  adjustment: "Korekce",
  purchase: "Příjem",
  return: "Vratka",
  sale: "Prodej",
  usage: "Spotřeba",
  waste: "Odpis",
};

function InventoryHeader() {
  return (
    <PageHeader
      description="Minimum pro provozní sklad: produkty, nízké zásoby a audit příjmů, spotřeby, prodejů a korekcí."
      eyebrow="Business suite"
      title="Sklad"
    />
  );
}

function InventorySummary({ products }: { products: InventoryProduct[] }) {
  const activeProducts = products.filter((product) => product.is_active);
  const lowStockProducts = activeProducts.filter((product) => product.stock_quantity <= product.low_stock_threshold);
  const stockValue = activeProducts.reduce((sum, product) => sum + product.stock_quantity * (product.purchase_price ?? 0), 0);
  const currency = activeProducts.find((product) => product.purchase_price !== null)?.currency ?? "CZK";

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Produkty</p>
        <p className="mt-2 text-2xl font-semibold">{activeProducts.length}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Nízký sklad</p>
        <p className="mt-2 text-2xl font-semibold text-warning">{lowStockProducts.length}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Nákupní hodnota</p>
        <p className="mt-2 text-2xl font-semibold">{formatCurrencyForDisplay(stockValue, currency, 2)}</p>
      </div>
    </section>
  );
}

function InventoryProductsTable({ products }: { products: InventoryProduct[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="text-lg font-semibold">Produkty</h2>
        <p className="mt-1 text-sm text-muted-foreground">Nízký stav se hlídá podle prahu u produktu.</p>
      </div>
      {products.length === 0 ? (
        <div className="p-8 text-center text-sm font-medium text-muted-foreground">Zatím není založený žádný produkt.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Produkt</th>
                <th className="px-4 py-3">Sklad</th>
                <th className="px-4 py-3">Nízký od</th>
                <th className="px-4 py-3">Nákup</th>
                <th className="px-4 py-3">Prodej</th>
                <th className="px-4 py-3">Stav</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => {
                const isLowStock = product.stock_quantity <= product.low_stock_threshold;

                return (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku ?? "Bez SKU"}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {product.stock_quantity} {product.unit}
                    </td>
                    <td className="px-4 py-3">{product.low_stock_threshold} {product.unit}</td>
                    <td className="px-4 py-3">
                      {product.purchase_price === null ? "Není" : formatCurrencyForDisplay(product.purchase_price, product.currency, 2)}
                    </td>
                    <td className="px-4 py-3">
                      {product.retail_price === null ? "Není" : formatCurrencyForDisplay(product.retail_price, product.currency, 2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={isLowStock ? "font-semibold text-warning" : "font-semibold text-success"}>
                        {isLowStock ? "Nízký sklad" : "OK"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function InventoryMovementsList({ movements }: { movements: InventoryMovement[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Poslední pohyby</h2>
      <div className="mt-4 grid gap-3">
        {movements.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není zaevidovaný žádný skladový pohyb.</p>
        ) : (
          movements.map((movement) => (
            <article key={movement.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{movement.inventory_products?.name ?? "Produkt"}</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {reasonLabels[movement.reason] ?? movement.reason} · {new Date(movement.created_at).toLocaleString("cs-CZ")}
                  </p>
                  {movement.note ? <p className="mt-1 text-sm text-muted-foreground">{movement.note}</p> : null}
                </div>
                <p className={movement.quantity_delta > 0 ? "font-bold text-success" : "font-bold text-destructive"}>
                  {movement.quantity_delta > 0 ? "+" : ""}
                  {movement.quantity_delta} {movement.inventory_products?.unit ?? "ks"}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const demoProducts: InventoryProduct[] = [
  {
    currency: "CZK",
    id: "demo-product-1",
    is_active: true,
    low_stock_threshold: 3,
    name: "Pomáda Strong Hold",
    purchase_price: 18000,
    retail_price: 32000,
    sku: "POM-STRONG",
    stock_quantity: 8,
    unit: "ks",
    updated_at: new Date().toISOString(),
  },
  {
    currency: "CZK",
    id: "demo-product-2",
    is_active: true,
    low_stock_threshold: 5,
    name: "Jednorázové ručníky",
    purchase_price: 1200,
    retail_price: null,
    sku: null,
    stock_quantity: 2,
    unit: "bal",
    updated_at: new Date().toISOString(),
  },
];

export default async function InventoryPage() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <InventoryHeader />
        <InventorySummary products={demoProducts} />
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <InventoryProductsTable products={demoProducts} />
            <InventoryMovementsList movements={[]} />
          </div>
          <div className="grid gap-6">
            <InventoryProductForm />
            <InventoryMovementForm products={demoProducts} />
          </div>
        </div>
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const [{ data: products }, { data: movements }] = await Promise.all([
    auth.supabase
      .from("inventory_products")
      .select("id, currency, is_active, low_stock_threshold, name, purchase_price, retail_price, sku, stock_quantity, unit, updated_at")
      .eq("tenant_id", auth.tenantId)
      .eq("is_active", true)
      .order("name", { ascending: true }),
    auth.supabase
      .from("inventory_movements")
      .select("id, created_at, quantity_delta, reason, note, inventory_products(name, unit)")
      .eq("tenant_id", auth.tenantId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const inventoryProducts = (products ?? []) as InventoryProduct[];
  const inventoryMovements = (movements ?? []) as InventoryMovement[];

  return (
    <section className="flex flex-col gap-6">
      <InventoryHeader />
      <InventorySummary products={inventoryProducts} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <InventoryProductsTable products={inventoryProducts} />
          <InventoryMovementsList movements={inventoryMovements} />
        </div>
        <div className="grid gap-6">
          <InventoryProductForm />
          <InventoryMovementForm products={inventoryProducts} />
        </div>
      </div>
    </section>
  );
}
