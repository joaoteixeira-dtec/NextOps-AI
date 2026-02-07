import { CheckCircle2, Rocket, Search, Sparkles } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

const steps = [
  {
    icon: Search,
    title: "Sprint 1 — Diagnóstico",
    meta: "1 semana",
    points: [
      "Mapeamento do processo real",
      "Gargalos + quick wins",
      "Protótipo do fluxo (claro e simples)",
    ],
  },
  {
    icon: Rocket,
    title: "Sprint 2 — ERP Core",
    meta: "2–4 semanas",
    points: [
      "Módulos essenciais a funcionar",
      "Permissões e rastreio",
      "Dados centralizados + dashboards",
    ],
  },
  {
    icon: Sparkles,
    title: "Sprint 3 — IA Gemini",
    meta: "1–2 semanas",
    points: [
      "Leitura de docs (PDF/email)",
      "Assistente interno + automações",
      "Resumos, triagens e preenchimentos",
    ],
  },
  {
    icon: CheckCircle2,
    title: "Otimização contínua",
    meta: "mensal",
    points: [
      "Melhorias e novas integrações",
      "KPIs e redução de erros",
      "Evolução por prioridades",
    ],
  },
];

export function Process() {
  return (
    <Section
      id="processo"
      eyebrow="Como trabalhamos"
      title="Entregamos por sprints — sem projetos infinitos"
      subtitle="Resultados rápidos, risco baixo, e uma evolução constante do sistema."
    >
      <div className="grid gap-4 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.05}>
            <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <s.icon size={18} />
                </div>
                <div className="text-xs text-white/55">{s.meta}</div>
              </div>
              <div className="mt-4 text-sm font-semibold">{s.title}</div>
              <ul className="mt-3 grid gap-2 text-sm text-white/70">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-r from-white/6 to-white/3 p-6 backdrop-blur-xl">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="text-sm font-semibold">O que recebes no final do Diagnóstico</div>
            <p className="mt-2 text-sm text-white/70">
              Uma página com 3 gargalos + 3 automações com IA + proposta de sprint com prazo e investimento.
            </p>
          </div>
          <a
            href="#form"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-semibold text-ink-950 hover:bg-white/90"
          >
            Pedir Diagnóstico (48h)
          </a>
        </div>
      </div>
    </Section>
  );
}
