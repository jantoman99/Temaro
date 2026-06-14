import type { DialogHTMLAttributes, HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

type DialogProps = DialogHTMLAttributes<HTMLDialogElement> & {
  children: ReactNode
}

function Dialog({ className, children, ...props }: DialogProps) {
  return (
    <dialog
      data-slot="dialog"
      className={cn(
        "max-w-lg rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-[var(--shadow-lg)] backdrop:bg-foreground/45",
        className,
      )}
      {...props}
    >
      {children}
    </dialog>
  )
}

function DialogContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="dialog-content" className={cn("p-5", className)} {...props} />
}

function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="dialog-header" className={cn("grid gap-1.5", className)} {...props} />
}

function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 data-slot="dialog-title" className={cn("text-lg font-semibold tracking-tight", className)} {...props} />
}

function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="dialog-description" className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />
}

export { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle }
