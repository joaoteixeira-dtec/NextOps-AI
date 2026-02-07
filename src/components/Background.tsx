import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function Background() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "18%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "-12%"]);
  const rot = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 18]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="noise" />
      <div className="grid-overlay" />

      {/* Aurora blobs */}
      <motion.div
        style={{ y: y1, rotate: rot }}
        className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/35 via-emerald-400/25 to-fuchsia-400/15 blur-3xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute -bottom-48 left-[10%] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-emerald-400/25 via-blue-500/15 to-transparent blur-3xl"
      />
      <motion.div
        style={{ y: y1 }}
        className="absolute -bottom-56 right-[5%] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-fuchsia-400/15 via-blue-500/18 to-transparent blur-3xl"
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-950/85 to-ink-950" />
    </div>
  );
}
