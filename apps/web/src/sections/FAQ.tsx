import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

const faqs = [
  {
    q: "Isto é um ERP de prateleira?",
    a: "Não. Partimos de uma base modular para ganhar velocidade e adaptamos ao teu processo real — campos, estados, regras, permissões, relatórios.",
  },
  {
    q: "A IA vai inventar coisas?",
    a: "A IA é aplicada com guardrails: extrair, resumir, classificar, sugerir. A lógica e dados críticos ficam validados por regras.",
  },
  {
    q: "Quanto tempo demora?",
    a: "Depende do core. Normalmente: 1 semana diagnóstico + 2–4 semanas ERP core + 1–2 semanas IA. Entregas por sprint.",
  },
  {
    q: "Integram com ferramentas existentes?",
    a: "Sim — email, CRMs, pagamentos, APIs, webhooks. No diagnóstico decidimos o que gera impacto rápido.",
  },
  {
    q: "Como garantem segurança?",
    a: "Perfis por função, regras de acesso, logs e auditoria. O desenho de permissões faz parte do core.",
  },
];

export function FAQ() {
  return (
    <Section
      id="faq"
      eyebrow="FAQ"
      title="Perguntas frequentes"
      subtitle="Dúvida que não está aqui? Pede o diagnóstico e respondemos."
    >
      <div className="mx-auto max-w-3xl grid gap-2.5">
        {faqs.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.04} variant="blur-up">
            <AccordionItem q={f.q} a={f.a} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors duration-300 hover:border-white/[0.1]">
      <button
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="text-sm font-semibold">{q}</div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <ChevronDown size={16} className="text-white/40" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 text-[13px] leading-relaxed text-white/50">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
