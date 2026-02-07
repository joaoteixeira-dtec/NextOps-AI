import * as React from "react";
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
    "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition will-change-transform active:translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30";
  const sizes = {
    sm: "h-10 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
  }[size];

  const variants = {
    primary:
      "bg-white text-ink-950 hover:bg-white/90 shadow-soft",
    secondary:
      "bg-white/10 text-white hover:bg-white/14 border border-white/10",
    ghost: "bg-transparent text-white hover:bg-white/10",
  }[variant];

  return <button className={cn(base, sizes, variants, className)} {...props} />;
}