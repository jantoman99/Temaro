import { describe, expect, it } from "vitest"

import type { AvailabilitySlot } from "@/lib/booking/availability"
import {
  getAvailableBookingSlots,
  getAvailableBookingStaff,
  getSelectedBookingSlot,
  shouldShowStaffNameInSlots,
  type PublicBookingStaff,
} from "@/lib/booking/public-form-options"

function staff(id: string, serviceIds: string[]): PublicBookingStaff {
  return {
    bio: null,
    avatar_url: null,
    color: null,
    created_at: "2026-05-01T00:00:00.000Z",
    deleted_at: null,
    id,
    is_active: true,
    name: `Staff ${id}`,
    tenant_id: "tenant-1",
    user_id: null,
    staff_services: serviceIds.map((serviceId) => ({
      service_id: serviceId,
      staff_id: id,
      tenant_id: "tenant-1",
    })),
  }
}

function slot(id: string, serviceId: string, staffId: string): AvailabilitySlot {
  return {
    id,
    label: id,
    serviceId,
    staffId,
    startsAt: "2026-05-01T10:00:00.000Z",
  }
}

describe("public booking form options", () => {
  it("filters staff by selected service", () => {
    const result = getAvailableBookingStaff({
      selectedServiceId: "service-a",
      staff: [staff("staff-1", ["service-a"]), staff("staff-2", ["service-b"])],
    })

    expect(result.map((member) => member.id)).toEqual(["staff-1"])
  })

  it("filters slots by selected service and selected staff", () => {
    const result = getAvailableBookingSlots({
      availabilitySlots: [
        slot("slot-1", "service-a", "staff-1"),
        slot("slot-2", "service-a", "staff-2"),
        slot("slot-3", "service-b", "staff-1"),
      ],
      selectedServiceId: "service-a",
      selectedStaffId: "staff-2",
    })

    expect(result.map((item) => item.id)).toEqual(["slot-2"])
  })

  it("allows any staff and limits visible slots to 24", () => {
    const result = getAvailableBookingSlots({
      availabilitySlots: Array.from({ length: 30 }, (_, index) =>
        slot(`slot-${index}`, "service-a", index % 2 === 0 ? "staff-1" : "staff-2"),
      ),
      selectedServiceId: "service-a",
      selectedStaffId: "any",
    })

    expect(result).toHaveLength(24)
    expect(result[0]?.id).toBe("slot-0")
    expect(result[23]?.id).toBe("slot-23")
  })

  it("returns selected slot or falls back to the first available slot", () => {
    const availableSlots = [slot("slot-1", "service-a", "staff-1"), slot("slot-2", "service-a", "staff-1")]

    expect(getSelectedBookingSlot({ availableSlots, selectedSlotId: "slot-2" })?.id).toBe("slot-2")
    expect(getSelectedBookingSlot({ availableSlots, selectedSlotId: "missing" })?.id).toBe("slot-1")
    expect(getSelectedBookingSlot({ availableSlots: [], selectedSlotId: "slot-1" })).toBeNull()
  })

  it("shows staff names only in any-staff mode with multiple matching staff", () => {
    expect(shouldShowStaffNameInSlots({ availableStaffCount: 2, selectedStaffId: "any" })).toBe(true)
    expect(shouldShowStaffNameInSlots({ availableStaffCount: 1, selectedStaffId: "any" })).toBe(false)
    expect(shouldShowStaffNameInSlots({ availableStaffCount: 2, selectedStaffId: "staff-1" })).toBe(false)
  })
})
