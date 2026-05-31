import { z } from "zod";

export const revenueReportSearchParamsSchema = z.object({
  period: z.enum(["30d", "90d", "year"]).catch("30d"),
});
