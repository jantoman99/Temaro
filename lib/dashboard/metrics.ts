export function getNoShowRate({
  noShowBookings,
  totalBookings,
}: {
  noShowBookings: number;
  totalBookings: number;
}) {
  if (totalBookings <= 0) {
    return 0;
  }

  return Math.round((Math.max(noShowBookings, 0) / totalBookings) * 100);
}

export function getOccupancyRate({
  bookedSlots,
  freeSlots,
}: {
  bookedSlots: number;
  freeSlots: number;
}) {
  const safeBookedSlots = Math.max(bookedSlots, 0);
  const totalSlots = safeBookedSlots + Math.max(freeSlots, 0);

  if (totalSlots <= 0) {
    return 0;
  }

  return Math.round((safeBookedSlots / totalSlots) * 100);
}

export function formatPercent(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))} %`;
}
