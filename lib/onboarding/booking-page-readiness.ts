export type BookingPageReadinessInput = {
  serviceAssignmentsCount: number;
  servicesCount: number;
  staffCount: number;
  workingHoursCount: number;
};

export function getBookingPageReadiness(input: BookingPageReadinessInput) {
  const checks = [
    {
      done: input.servicesCount > 0,
      href: "/services",
      label: "Služba",
      missingHeadline: "Chybí první služba",
      missingText: "Přidejte alespoň jednu službu, aby klient věděl, co si objednává.",
    },
    {
      done: input.staffCount > 0,
      href: "/staff",
      label: "Tým",
      missingHeadline: "Chybí člen týmu",
      missingText: "Přidejte člověka, ke kterému se klient může objednat.",
    },
    {
      done: input.workingHoursCount > 0,
      href: "/staff",
      label: "Pracovní doba",
      missingHeadline: "Chybí pracovní doba",
      missingText: "Nastavte běžné hodiny, aby se klientům zobrazily volné termíny.",
    },
    {
      done: input.serviceAssignmentsCount > 0,
      href: "/staff",
      label: "Služby u týmu",
      missingHeadline: "Chybí propojení služby s týmem",
      missingText: "Přiřaďte službu člověku v týmu, aby bylo jasné, kdo ji dělá.",
    },
  ];
  const firstMissingCheck = checks.find((check) => !check.done);

  return {
    canReceiveBookings: !firstMissingCheck,
    checks,
    headline: firstMissingCheck?.missingHeadline ?? "Klient už může rezervovat",
    nextHref: firstMissingCheck?.href ?? "/staff",
    text: firstMissingCheck?.missingText ?? "Zkontrolujte náhled a potom pošlete odkaz prvním klientům.",
  };
}
