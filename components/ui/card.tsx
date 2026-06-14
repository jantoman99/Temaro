import type { HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-2xl border border-border bg-card text-card-foreground",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        flat: "shadow-none",
        glass: "bg-card/88 shadow-sm backdrop-blur-[var(--blur-md)]",
        elevated: "shadow-[var(--shadow-lg)]",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-5",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  },
)

function Card({
  className,
  padding,
  variant,
  ...props
}: HTMLAttributes<HTMLElement> & VariantProps<typeof cardVariants>) {
  return (
    <section
      data-slot="card"
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
}

export { Card, cardVariants }
