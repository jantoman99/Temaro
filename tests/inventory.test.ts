import { describe, expect, it } from "vitest";

import { inventoryMovementSchema, inventoryProductSchema } from "@/lib/validations/inventory";

describe("inventory validations", () => {
  it("normalizuje produkt a ceny uklada v halerich", () => {
    const parsed = inventoryProductSchema.parse({
      currency: "CZK",
      lowStockThreshold: "3",
      name: " Pomáda ",
      purchasePrice: "180,50",
      retailPrice: "320",
      sku: " POM-1 ",
      stockQuantity: "8",
      unit: "ks",
    });

    expect(parsed).toEqual({
      currency: "CZK",
      lowStockThreshold: 3,
      name: "Pomáda",
      purchasePrice: 18050,
      retailPrice: 32000,
      sku: "POM-1",
      stockQuantity: 8,
      unit: "ks",
    });
  });

  it("odmitne zaporne pocatecni mnozstvi produktu", () => {
    const parsed = inventoryProductSchema.safeParse({
      currency: "CZK",
      lowStockThreshold: "0",
      name: "Produkt",
      purchasePrice: "",
      retailPrice: "",
      stockQuantity: "-1",
      unit: "ks",
    });

    expect(parsed.success).toBe(false);
  });

  it("povoli zaporny skladovy pohyb, ale ne nulovy pohyb", () => {
    const validMovement = inventoryMovementSchema.safeParse({
      productId: "11111111-1111-4111-8111-111111111111",
      quantityDelta: "-2",
      reason: "usage",
    });
    const invalidMovement = inventoryMovementSchema.safeParse({
      productId: "11111111-1111-4111-8111-111111111111",
      quantityDelta: "0",
      reason: "usage",
    });

    expect(validMovement.success).toBe(true);
    expect(invalidMovement.success).toBe(false);
  });

  it("odmitne neplatny duvod pohybu", () => {
    const parsed = inventoryMovementSchema.safeParse({
      productId: "11111111-1111-4111-8111-111111111111",
      quantityDelta: "1",
      reason: "free-text",
    });

    expect(parsed.success).toBe(false);
  });
});
