import { motion, useScroll, useTransform } from "framer-motion";
import { lazy, Suspense } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

const ParticleField = lazy(() =>
  import("./ParticleField").then((m) => ({ default: m.ParticleField }))
);

export function Background() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "20%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "-15%"]);
  const rot = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 20]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="noise" />
      <div className="grid-overlay" />

      {/* Three.js particle constellation (desktop only, lazy) */}
      <Suspense fallback={null}>
        <ParticleField />
      </Suspense>

      {/* Aurora gradient orbs */}
      <motion.div
        style={{ y: y1, rotate: rot }}
        className="glow-orb -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 bg-gradient-to-br from-indigo-500/30 via-cyan-400/20 to-fuchsia-400/10"
      />
      <motion.div
        style={{ y: y2 }}
        className="glow-orb -bottom-40 left-[8%] h-[450px] w-[450px] bg-gradient-to-br from-emerald-400/20 via-indigo-500/12 to-transparent"
      />
      <motion.div
        style={{ y: y1 }}
        className="glow-orb -bottom-48 right-[3%] h-[550px] w-[550px] bg-gradient-to-br from-fuchsia-400/12 via-indigo-500/15 to-transparent"
      />
      <motion.div
        style={{ y: y2 }}
        className="glow-orb top-[40%] right-[15%] h-[350px] w-[350px] bg-gradient-to-br from-violet-500/10 via-cyan-400/8 to-transparent"
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/90 via-ink-950/70 to-ink-950" />
    </div>
  );
}
