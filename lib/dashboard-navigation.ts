import {
  Boxes,
  CalendarDays,
  ClipboardCheck,
  Coins,
  CreditCard,
  Dumbbell,
  KeyRound,
  Layers3,
  MapPinned,
  Megaphone,
  MonitorSmartphone,
  PackageSearch,
  ReceiptText,
  Repeat2,
  RotateCcw,
  Settings,
  Share2,
  ShoppingCart,
  Tag,
  TicketPercent,
  Upload,
  UserRoundCog,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  badge?: string;
  href: string;
  icon: LucideIcon;
  label: string;
  tourId?: string;
};

export type NavGroup = {
  items: NavItem[];
  label: string;
};

const primaryOwnerLinks: NavItem[] = [
  { href: "/start", icon: ClipboardCheck, label: "Start", tourId: "start" },
  { href: "/calendar", icon: CalendarDays, label: "Kalendář", tourId: "calendar" },
  { href: "/clients", icon: UsersRound, label: "Klienti" },
  { href: "/services", icon: Tag, label: "Služby", tourId: "services" },
  { href: "/staff", icon: UserRoundCog, label: "Tým", tourId: "staff" },
  { href: "/booking-page", icon: MonitorSmartphone, label: "Rezervační stránka", tourId: "booking-page" },
];

const advancedOwnerLinks: NavItem[] = [
  { href: "/payments", icon: CreditCard, label: "Platby" },
  { href: "/pos", icon: ShoppingCart, label: "Pokladna" },
  { href: "/inventory", icon: PackageSearch, label: "Sklad" },
  { href: "/vouchers", icon: TicketPercent, label: "Vouchery" },
  { href: "/packages", icon: Layers3, label: "Balíčky" },
  { href: "/memberships", icon: Repeat2, label: "Členství" },
  { href: "/campaigns", icon: Megaphone, label: "Kampaně" },
  { href: "/resources", icon: Boxes, label: "Zdroje" },
  { href: "/locations", icon: MapPinned, label: "Pobočky" },
  { href: "/classes", icon: Dumbbell, label: "Lekce" },
  { href: "/referrals", icon: Share2, label: "Doporučení" },
  { href: "/commissions", icon: Coins, label: "Provize" },
  { href: "/recovery", icon: RotateCcw, label: "Volné termíny" },
  { href: "/integrations", icon: KeyRound, label: "Integrace" },
  { href: "/reports", icon: ReceiptText, label: "Reporty" },
  { href: "/import", icon: Upload, label: "Import" },
  { href: "/settings", icon: Settings, label: "Nastavení" },
];

export function getDashboardNavigationGroups(isOwner: boolean): NavGroup[] {
  if (!isOwner) {
    return [
      {
        items: [{ href: "/calendar", icon: CalendarDays, label: "Kalendář", tourId: "calendar" }],
        label: "Provoz",
      },
    ];
  }

  return [
    {
      items: primaryOwnerLinks,
      label: "Základ",
    },
    {
      items: advancedOwnerLinks,
      label: "Pokročilé",
    },
  ];
}
