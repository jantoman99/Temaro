export type CommissionRule = {
  currency: string;
  fixed_amount: number;
  is_active: boolean;
  percent_bps: number;
  rule_type: "percent_paid_revenue" | "fixed_completed_booking";
};

export type StaffPerformanceInput = {
  completedBookings: number;
  paidRevenue: number;
  rule?: CommissionRule | null;
};

export function calculateEstimatedCommission(input: StaffPerformanceInput) {
  const rule = input.rule;

  if (!rule || !rule.is_active) {
    return 0;
  }

  if (rule.rule_type === "fixed_completed_booking") {
    return Math.max(input.completedBookings, 0) * Math.max(rule.fixed_amount, 0);
  }

  return Math.round((Math.max(input.paidRevenue, 0) * Math.max(rule.percent_bps, 0)) / 10_000);
}
