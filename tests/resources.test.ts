import { describe, expect, it } from "vitest";

import { resourceSchema, serviceResourceSchema } from "@/lib/validations/resources";

const UUID_1 = "11111111-1111-4111-8111-111111111111";
const UUID_2 = "22222222-2222-4222-8222-222222222222";

describe("resource validations", () => {
  it("normalizuje rezervovatelny zdroj", () => {
    const parsed = resourceSchema.parse({
      capacity: "2",
      description: " Hlavní místnost ",
      name: " Místnost 1 ",
      resourceType: "room",
    });

    expect(parsed).toEqual({
      capacity: 2,
      description: "Hlavní místnost",
      name: "Místnost 1",
      resourceType: "room",
    });
  });

  it("odmitne nulovou kapacitu", () => {
    expect(resourceSchema.safeParse({ capacity: "0", name: "Místnost", resourceType: "room" }).success).toBe(false);
  });

  it("validuje vazbu sluzby a zdroje", () => {
    expect(serviceResourceSchema.parse({ resourceId: UUID_1, serviceId: UUID_2 })).toEqual({
      resourceId: UUID_1,
      serviceId: UUID_2,
    });
  });
});
