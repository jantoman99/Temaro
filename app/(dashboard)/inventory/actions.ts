"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { inventoryMovementSchema, inventoryProductSchema } from "@/lib/validations/inventory";

type InventoryActionState = {
  error?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getOptionalStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : undefined;
}

export async function createInventoryProductAction(
  _previousState: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = inventoryProductSchema.safeParse({
    currency: getStringValue(formData, "currency"),
    lowStockThreshold: getStringValue(formData, "lowStockThreshold") || "0",
    name: getStringValue(formData, "name"),
    purchasePrice: getOptionalStringValue(formData, "purchasePrice"),
    retailPrice: getOptionalStringValue(formData, "retailPrice"),
    sku: getOptionalStringValue(formData, "sku"),
    stockQuantity: getStringValue(formData, "stockQuantity") || "0",
    unit: getStringValue(formData, "unit") || "ks",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Produkt se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: produkt by se tady založil." };
  }

  const { error } = await auth.supabase.from("inventory_products").insert({
    currency: parsed.data.currency,
    low_stock_threshold: parsed.data.lowStockThreshold,
    name: parsed.data.name,
    purchase_price: parsed.data.purchasePrice,
    retail_price: parsed.data.retailPrice,
    sku: parsed.data.sku ?? null,
    stock_quantity: parsed.data.stockQuantity,
    tenant_id: auth.tenantId,
    unit: parsed.data.unit,
  });

  if (error) {
    return { error: "Produkt se nepodařilo uložit." };
  }

  revalidatePath("/inventory");

  return { success: "Produkt byl přidán do skladu." };
}

export async function recordInventoryMovementAction(
  _previousState: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = inventoryMovementSchema.safeParse({
    note: getOptionalStringValue(formData, "note"),
    productId: getStringValue(formData, "productId"),
    quantityDelta: getStringValue(formData, "quantityDelta"),
    reason: getStringValue(formData, "reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Skladový pohyb se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: skladový pohyb by se tady zaevidoval." };
  }

  const { error } = await auth.supabase.rpc("record_inventory_movement", {
    p_note: parsed.data.note ?? null,
    p_product_id: parsed.data.productId,
    p_quantity_delta: parsed.data.quantityDelta,
    p_reason: parsed.data.reason,
  });

  if (error) {
    return { error: "Skladový pohyb se nepodařilo uložit. Zkontrolujte, že sklad nepůjde do mínusu." };
  }

  revalidatePath("/inventory");

  return { success: "Skladový pohyb byl zaevidován." };
}
