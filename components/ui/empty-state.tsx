import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  actionHref?: string
  actionLabel?: string
  className?: string
  description: string
  icon: LucideIcon
  title: ReactNode
}

function getSafeInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//") ? href : null
}

export function EmptyState({
  actionHref,
  actionLabel,
  className,
  description,
  icon: Icon,
  title,
}: EmptyStateProps) {
  const safeActionHref = actionHref ? getSafeInternalHref(actionHref) : null
  const action =
    safeActionHref && actionLabel ? (
      <a className={buttonVariants({ size: "lg" })} href={safeActionHref}>
        {actionLabel}
      </a>
    ) : null

  return (
    <section
      className={cn(
        "flex flex-col items-center border-y border-dashed border-border bg-transparent px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground">
        <Icon className="size-8 stroke-[1.75]" />
      </div>
      <h2 className="mt-5 text-base font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  )
}
