import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react"

import { cn } from "@/lib/utils"

const inputClassName =
  "rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"

function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      data-slot="input"
      className={cn(inputClassName, className)}
      {...props}
    />
  )
}

function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(inputClassName, "min-h-24 resize-y", className)}
      {...props}
    />
  )
}

export { Input, Textarea, inputClassName }
