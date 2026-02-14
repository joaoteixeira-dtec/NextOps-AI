import { cn } from "../lib/cn";
import type { ReactNode } from "react";

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm transition-colors hover:border-white/12 hover:bg-white/[0.06]",
        className
      )}
    >
      {children}
    </span>
  );
}