export type ProductTourStep = {
  body: string;
  target: string;
  title: string;
};

export const PRODUCT_TOUR_STEPS: ProductTourStep[] = [
  {
    body: "Tady dokončíte první spuštění. Temaro vás pustí krok za krokem od oboru až ke sdílení odkazu.",
    target: "start",
    title: "Začněte tady",
  },
  {
    body: "Služby určují, co si klient může objednat, jak dlouho návštěva trvá a kolik stojí.",
    target: "services",
    title: "Přidejte nabídku",
  },
  {
    body: "Tým a pracovní doba rozhodují, kdy se klientům zobrazí volné termíny.",
    target: "staff",
    title: "Nastavte čas",
  },
  {
    body: "Rezervační stránka je pohled klienta. Tady zkontrolujete odkaz, QR kód a texty ke sdílení.",
    target: "booking-page",
    title: "Zkontrolujte stránku klienta",
  },
  {
    body: "Kalendář je běžná denní práce po spuštění. Nové rezervace se budou objevovat tady.",
    target: "calendar",
    title: "Potom sledujte provoz",
  },
];
