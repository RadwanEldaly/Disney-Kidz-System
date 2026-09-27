import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors duration-150 focus-visible:border-accent disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
