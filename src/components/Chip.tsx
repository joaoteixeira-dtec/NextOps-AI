import { cn } from "../lib/cn";
import type { ReactNode } from "react";

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80",
        className
      )}
    >
      {children}
    </span>
  );
}