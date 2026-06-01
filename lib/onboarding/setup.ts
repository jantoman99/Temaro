export type LaunchStep = {
  description: string;
  done: boolean;
  href: string;
  title: string;
};

export type LaunchPlan = {
  bookingUrlPath: string;
  completedSteps: number;
  isReadyToShare: boolean;
  nextAction: {
    description: string;
    href: string;
    label: string;
  };
  readiness: number;
  sharePanel: {
    headline: string;
    primaryHref: string;
    primaryLabel: string;
    text: string;
  };
  steps: LaunchStep[];
};

export function getLaunchReadiness(steps: Pick<LaunchStep, "done">[]) {
  if (steps.length === 0) return 0;

  return Math.round((steps.filter((step) => step.done).length / steps.length) * 100);
}

export function buildLaunchPlan({
  bookingsCount,
  servicesCount,
  staffCount,
  tenant,
}: {
  bookingsCount: number;
  servicesCount: number;
  staffCount: number;
  tenant: { name: string; slug: string };
}): LaunchPlan {
  const bookingUrlPath = tenant.slug ? `/${tenant.slug}` : "/booking-page";
  const hasBusinessName = tenant.name.trim().length >= 2;
  const hasServices = servicesCount > 0;
  const hasStaff = staffCount > 0;
  const isReadyToShare = hasBusinessName && hasServices && hasStaff;
  const steps: LaunchStep[] = [
    {
      done: hasBusinessName,
      href: "/settings",
      title: "Zkontrolovat podnik",
      description: "Název, kontakt, adresa, storno pravidla a veřejné údaje.",
    },
    {
      done: hasServices,
      href: "/services",
      title: "Přidat první službu",
      description: "Služba, délka, cena a případná záloha pro klienta.",
    },
    {
      done: hasStaff,
      href: "/staff",
      title: "Nastavit tým a pracovní dobu",
      description: "Kdo službu dělá, kdy má volno a kdy může přijímat rezervace.",
    },
    {
      done: isReadyToShare,
      href: "/booking-page",
      title: "Projít rezervační stránku",
      description: "Zkontrolovat, co klient uvidí před odesláním rezervace.",
    },
    {
      done: bookingsCount > 0,
      href: bookingUrlPath,
      title: "Poslat odkaz prvním klientům",
      description: "Sdílet odkaz na webu, Instagramu, v SMS nebo přes QR kód.",
    },
  ];
  const firstMissingStep = isReadyToShare ? null : steps.find((step) => !step.done);

  return {
    bookingUrlPath,
    completedSteps: steps.filter((step) => step.done).length,
    isReadyToShare,
    nextAction: firstMissingStep
      ? {
          description: firstMissingStep.description,
          href: firstMissingStep.href,
          label: firstMissingStep.title,
        }
      : {
          description: "Rezervační stránka má základ hotový. Zkontrolujte ji a potom pošlete odkaz prvním klientům.",
          href: "/booking-page",
          label: "Zkontrolovat a sdílet stránku",
        },
    readiness: getLaunchReadiness(steps),
    sharePanel: {
      headline: isReadyToShare ? "Pošlete odkaz prvním klientům" : "Sdílení se otevře po dokončení základu",
      primaryHref: bookingUrlPath,
      primaryLabel: isReadyToShare ? "Otevřít stránku klienta" : "Nejprve dokončit základ",
      text: isReadyToShare
        ? "Použijte odkaz do Instagram bia, Google profilu, SMS nebo QR kódu v provozovně."
        : "Jakmile bude hotová služba a tým s pracovní dobou, dostanete tady odkazy a texty ke sdílení.",
    },
    steps,
  };
}
