import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { cn } from "../lib/cn";

const faqs = [
  {
    q: "Isto é um ERP “de prateleira”?",
    a: "Não. Partimos de uma base modular para ganhar velocidade e adaptamos ao teu processo real (campos, estados, regras, permissões, relatórios).",
  },
  {
    q: "A IA vai “inventar” coisas?",
    a: "A IA é aplicada com guardrails: para extrair, resumir, classificar e sugerir. A lógica e os dados críticos ficam validados por regras e permissões.",
  },
  {
    q: "Quanto tempo demora a implementar?",
    a: "Depende do core. Normalmente: 1 semana diagnóstico + 2–4 semanas ERP core + 1–2 semanas IA. Entregas por sprint, sem parar a operação.",
  },
  {
    q: "Integram com as ferramentas que já usamos?",
    a: "Sim — email, CRMs, pagamentos, APIs, webhooks. No diagnóstico decidimos o que vale a pena integrar para gerar impacto rápido.",
  },
  {
    q: "Como garantem segurança e permissões?",
    a: "Perfis por função, regras de acesso, logs e auditoria. O desenho de permissões faz parte do core desde o início.",
  },
];

export function FAQ() {
  return (
    <Section
      id="faq"
      eyebrow="FAQ"
      title="Perguntas rápidas"
      subtitle="Se a tua dúvida não estiver aqui, pede o diagnóstico e respondemos com base no teu caso."
    >
      <div className="grid gap-3">
        {faqs.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.04}>
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
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <button
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="text-sm font-semibold">{q}</div>
        <ChevronDown className={cn("transition", open && "rotate-180")} size={18} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm leading-relaxed text-white/70">
          {a}
        </div>
      )}
    </div>
  );
}
