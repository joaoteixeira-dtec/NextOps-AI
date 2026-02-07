import { Quote } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

const testimonials = [
  {
    quote:
      "Passámos de “ninguém sabe o estado” para visibilidade total. O tempo perdido em confirmações caiu a pique.",
    name: "Direção Operacional",
    meta: "Serviços no terreno (PME)",
  },
  {
    quote:
      "A leitura automática de documentos e a triagem por IA pouparam horas todas as semanas. Isto foi o game changer.",
    name: "Gestão",
    meta: "Distribuição & armazém",
  },
  {
    quote:
      "O modelo por sprints foi decisivo. Entregas rápidas, sem surpresas, com prioridades claras.",
    name: "Administração",
    meta: "Backoffice pesado",
  },
];

export function Testimonials() {
  return (
    <Section
      eyebrow="Prova social"
      title="Resultados práticos, sem conversa"
      subtitle="Exemplos típicos do que as empresas sentem depois de centralizar e automatizar."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.05}>
            <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <Quote size={18} />
                </div>
                <div className="text-xs text-white/50">{t.meta}</div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/75">“{t.quote}”</p>
              <div className="mt-4 text-sm font-semibold">{t.name}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-xs text-white/45">
        *Testemunhos ilustrativos (placeholders). Troca por casos reais assim que tiverem.
      </p>
    </Section>
  );
}
