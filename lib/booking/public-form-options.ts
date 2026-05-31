import type { AvailabilitySlot } from "@/lib/booking/availability"
import type { Database } from "@/types/database"

export type PublicBookingStaff = Database["public"]["Tables"]["staff"]["Row"] & {
  staff_services: Database["public"]["Tables"]["staff_services"]["Row"][]
}

export function getAvailableBookingStaff({
  selectedServiceId,
  staff,
}: {
  selectedServiceId: string
  staff: PublicBookingStaff[]
}) {
  return staff.filter((member) =>
    member.staff_services.some((assignment) => assignment.service_id === selectedServiceId),
  )
}

export function getAvailableBookingSlots({
  availabilitySlots,
  selectedServiceId,
  selectedStaffId,
}: {
  availabilitySlots: AvailabilitySlot[]
  selectedServiceId: string
  selectedStaffId: string
}) {
  return availabilitySlots
    .filter((slot) => {
      if (slot.serviceId !== selectedServiceId) {
        return false
      }

      if (selectedStaffId === "any") {
        return true
      }

      return slot.staffId === selectedStaffId
    })
    .slice(0, 24)
}

export function getSelectedBookingSlot({
  availableSlots,
  selectedSlotId,
}: {
  availableSlots: AvailabilitySlot[]
  selectedSlotId: string
}) {
  return availableSlots.find((slot) => slot.id === selectedSlotId) ?? availableSlots[0] ?? null
}

export function shouldShowStaffNameInSlots({
  availableStaffCount,
  selectedStaffId,
}: {
  availableStaffCount: number
  selectedStaffId: string
}) {
  return selectedStaffId === "any" && availableStaffCount > 1
}
