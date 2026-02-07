import { cn } from "../lib/cn";
import { Container } from "./Container";
import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("relative scroll-mt-24 py-16 sm:py-20", className)}>
      <Container>
        {(eyebrow || title || subtitle) && (
          <div className="mb-10 max-w-3xl">
            {eyebrow && (
              <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/60">
                <span className="h-[1px] w-8 bg-white/20" />
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className="text-balance text-2xl font-semibold leading-tight sm:text-3xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 text-pretty text-base leading-relaxed text-white/70">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}