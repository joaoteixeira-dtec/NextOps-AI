import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { ReactNode } from "react";

type Variant = "slide-up" | "fade" | "scale" | "blur-up";

function getVariant(v: Variant) {
  switch (v) {
    case "slide-up":
      return { i: { opacity: 0, y: 24 }, a: { opacity: 1, y: 0 } };
    case "fade":
      return { i: { opacity: 0 }, a: { opacity: 1 } };
    case "scale":
      return { i: { opacity: 0, scale: 0.92 }, a: { opacity: 1, scale: 1 } };
    case "blur-up":
      return { i: { opacity: 0, y: 20, filter: "blur(8px)" }, a: { opacity: 1, y: 0, filter: "blur(0px)" } };
  }
}

export function Reveal({
  children,
  delay = 0,
  className,
  variant = "blur-up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: Variant;
}) {
  const reduced = useReducedMotion();
  const { i, a } = getVariant(variant);
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 1 } : i}
      whileInView={reduced ? { opacity: 1 } : a}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}