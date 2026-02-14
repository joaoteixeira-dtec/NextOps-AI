import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Section } from "../components/Section";

export function CTA() {
  return (
    <Section
      className="py-16"
      eyebrow="Vamos ao essencial"
      title="Operação sob controlo? Começa pelo diagnóstico."
      subtitle="Mapa claro com ganhos rápidos e proposta de sprint. Sem spam."
    >
      <motion.div
        whileHover={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-indigo-500/[0.06] via-white/[0.02] to-cyan-500/[0.04] p-6"
      >
        {/* Subtle glow */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2.5">
              <Sparkles size={16} className="text-indigo-300/70" />
            </div>
            <div>
              <div className="text-sm font-semibold">Diagnóstico + Mapa (48h)</div>
              <p className="mt-1.5 text-[13px] text-white/50">
                Processos espalhados, erros ou falta de visibilidade? Analisamos e propomos.
              </p>
            </div>
          </div>
          <a
            href="#form"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-ink-950 transition-all duration-300 hover:bg-white/90 hover:shadow-glow-sm active:scale-[0.98]"
          >
            Pedir agora
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </motion.div>
    </Section>
  );
}
