import { Quote } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

const testimonials = [
  {
    quote: "Passámos de 'ninguém sabe o estado' para visibilidade total. O tempo em confirmações caiu a pique.",
    name: "Direção Operacional",
    meta: "Serviços (PME)",
  },
  {
    quote: "A leitura automática de documentos e triagem por IA pouparam horas por semana. Game changer.",
    name: "Gestão",
    meta: "Distribuição",
  },
  {
    quote: "O modelo por sprints foi decisivo. Entregas rápidas, sem surpresas, prioridades claras.",
    name: "Administração",
    meta: "Backoffice",
  },
];

export function Testimonials() {
  return (
    <Section
      eyebrow="Resultados"
      title="Impacto real, sem conversa"
      subtitle="O que as equipas sentem depois de centralizar e automatizar."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.06} variant="blur-up">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors duration-400 hover:border-white/[0.1] hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-indigo-500/10 p-2.5">
                  <Quote size={14} className="text-indigo-300/60" />
                </div>
                <div className="text-[11px] text-white/35">{t.meta}</div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 text-sm font-semibold text-white/80">{t.name}</div>
            </motion.div>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-[11px] text-white/30">
        *Testemunhos ilustrativos. Substitui por casos reais.
      </p>
    </Section>
  );
}
