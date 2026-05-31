import type { Database } from "@/types/database";

type BookingStatus = Database["public"]["Tables"]["bookings"]["Row"]["status"];

export function getBookingStatusLabel(status: BookingStatus) {
  const labels: Record<BookingStatus, string> = {
    cancelled: "zrušeno",
    completed: "hotovo",
    confirmed: "potvrzeno",
    no_show: "no-show",
    pending: "čeká",
  };

  return labels[status];
}

export function getBookingStatusClassName(status: BookingStatus) {
  const classNames: Record<BookingStatus, string> = {
    cancelled: "border-border bg-muted text-muted-foreground",
    completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
    confirmed: "border-sky-500/30 bg-sky-500/10 text-sky-700",
    no_show: "border-red-500/30 bg-red-500/10 text-red-700",
    pending: "border-amber-500/30 bg-amber-500/10 text-amber-800",
  };

  return classNames[status];
}
