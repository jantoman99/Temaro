export type PosPaymentMethod = "cash" | "card_terminal" | "bank_transfer" | "voucher" | "other";

export type PosCheckoutPayment = {
  amount: number;
  status: string;
};

export type PosCheckoutBooking = {
  servicePrice: number;
  payments: PosCheckoutPayment[];
};

export function getPaidTotal(payments: PosCheckoutPayment[]) {
  return payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Math.max(payment.amount, 0), 0);
}

export function getRemainingAmount(booking: PosCheckoutBooking) {
  return Math.max(booking.servicePrice - getPaidTotal(booking.payments), 0);
}

export function getPosPaymentScope(booking: PosCheckoutBooking) {
  return getPaidTotal(booking.payments) > 0 ? "remaining" : "full";
}
