import { cn } from "../lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 will-change-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950";
  const sizes = {
    sm: "h-10 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
  }[size];

  const variants = {
    primary:
      "bg-white text-ink-950 hover:bg-white/90 hover:shadow-glow-sm shadow-soft",
    secondary:
      "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/10 hover:border-white/15 backdrop-blur-sm",
    ghost: "bg-transparent text-white hover:bg-white/[0.06]",
  }[variant];

  return <button className={cn(base, sizes, variants, className)} {...props} />;
}