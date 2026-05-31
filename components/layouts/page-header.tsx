import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type PageHeaderAction = {
  href: string;
  icon?: LucideIcon;
  label: string;
};

type PageHeaderProps = {
  action?: PageHeaderAction;
  description?: ReactNode;
  eyebrow?: string;
  rightSlot?: ReactNode;
  title: string;
};

export function PageHeader({ action, description, eyebrow, rightSlot, title }: PageHeaderProps) {
  const ActionIcon = action?.icon;

  return (
    <header className="rounded-2xl border border-border bg-card/88 p-5 shadow-sm backdrop-blur sm:flex sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <div className="mt-2 text-sm font-medium text-muted-foreground">{description}</div>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0">
        {rightSlot ? rightSlot : null}
        {action ? (
          <Link
            href={action.href}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            {action.label}
            {ActionIcon ? <ActionIcon className="h-4 w-4" /> : null}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
