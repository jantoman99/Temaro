type ServiceWithId = {
  id: string;
};

type StaffWithServices = {
  id: string;
  staff_services: Array<{
    service_id: string;
  }>;
};

export function getSafeInitialId(ids: string[], requestedId?: string, fallbackId = "") {
  if (requestedId && ids.includes(requestedId)) {
    return requestedId;
  }

  return fallbackId;
}

export function getAvailableServicesForStaff<T extends ServiceWithId>(
  services: T[],
  staff: StaffWithServices[],
  selectedStaffId: string,
) {
  const selectedStaff = staff.find((member) => member.id === selectedStaffId);
  const serviceIds = new Set(selectedStaff?.staff_services.map((item) => item.service_id) ?? []);

  return services.filter((service) => serviceIds.has(service.id));
}

export function getSafeSelectedServiceId<T extends ServiceWithId>(
  availableServices: T[],
  currentServiceId?: string,
) {
  if (currentServiceId && availableServices.some((service) => service.id === currentServiceId)) {
    return currentServiceId;
  }

  return availableServices[0]?.id ?? "";
}
