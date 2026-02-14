import { motion } from "framer-motion";
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
    <section id={id} className={cn("relative scroll-mt-24 py-16 sm:py-24", className)}>
      <Container>
        {(eyebrow || title || subtitle) && (
          <motion.div
            className="mb-12 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {eyebrow && (
              <div className="mb-3 inline-flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-white/50">
                <span className="h-[1px] w-10 bg-gradient-to-r from-indigo-400/60 to-transparent" />
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-pretty text-base leading-relaxed text-white/60 sm:text-lg">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}
        {children}
      </Container>
    </section>
  );
}