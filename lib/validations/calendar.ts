import { z } from "zod";

export const calendarSearchParamsSchema = z.object({
  booking: z.string().uuid().optional(),
  day: z.string().date().optional(),
  draftClientId: z.string().uuid().optional(),
  draftStartsAt: z.string().datetime({ local: true }).optional(),
  draftStaffId: z.string().uuid().optional(),
  query: z.string().trim().max(100).optional(),
  range: z.enum(["day", "3days", "week"]).optional(),
  source: z.enum(["all", "manual", "online", "instagram", "qr", "widget", "catalog", "google", "referral"]).optional(),
  staffId: z.string().uuid().optional(),
  staffIds: z.string().trim().max(500).optional(),
  status: z.enum(["all", "pending", "confirmed", "completed", "cancelled", "no_show"]).optional(),
  view: z.enum(["day", "week", "team"]).optional(),
});
