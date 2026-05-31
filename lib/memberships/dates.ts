export type BillingPeriod = "monthly" | "quarterly" | "yearly";

export function getNextBillingDate(startDate: Date, billingPeriod: BillingPeriod) {
  const nextDate = new Date(startDate);

  if (billingPeriod === "monthly") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (billingPeriod === "quarterly") {
    nextDate.setMonth(nextDate.getMonth() + 3);
  } else {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  }

  return nextDate.toISOString().slice(0, 10);
}
