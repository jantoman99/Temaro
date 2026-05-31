import { z } from "zod";

import { isSafeCustomDomain, normalizeCustomDomain } from "@/lib/custom-domain";

export const customDomainSchema = z.object({
  customDomain: z
    .string()
    .trim()
    .max(253, "Doména může mít maximálně 253 znaků.")
    .transform(normalizeCustomDomain)
    .refine((value) => value.length === 0 || isSafeCustomDomain(value), "Zadejte platnou doménu bez protokolu a cesty."),
});
