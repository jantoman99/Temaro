import type { HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-bold",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground",
        primary: "border-primary/20 bg-primary/10 text-primary",
        success: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/25 bg-warning/12 text-foreground",
        risk: "border-destructive/20 bg-destructive/10 text-destructive",
        muted: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
