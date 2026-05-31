import { createSlug, createSlugWithSuffix } from "@/lib/slug";

type TenantSlugAdmin = {
  from: (table: "tenants") => {
    select: (columns: string) => {
      ilike: (column: string, value: string) => {
        is: (column: string, value: null) => {
          maybeSingle: () => PromiseLike<{
            data: { id: string } | null;
            error: unknown;
          }>;
        };
      };
    };
  };
};

export async function findAvailableTenantSlug(
  admin: TenantSlugAdmin,
  businessName: string,
) {
  const baseSlug = createSlug(businessName) || "podnik";

  for (let suffix = 1; suffix <= 50; suffix += 1) {
    const slug = suffix === 1 ? baseSlug : createSlugWithSuffix(baseSlug, suffix);
    const { data: existingTenant, error } = await admin
      .from("tenants")
      .select("id")
      .ilike("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      return { error: true as const, slug: null };
    }

    if (!existingTenant) {
      return { error: false as const, slug };
    }
  }

  return { error: false as const, slug: null };
}
