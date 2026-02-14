import { CheckCircle2, Rocket, Search, Sparkles } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

const steps = [
  {
    icon: Search,
    title: "Diagnóstico",
    meta: "1 semana",
    num: "01",
    points: ["Mapeamento do processo real", "Gargalos + quick wins", "Protótipo do fluxo"],
  },
  {
    icon: Rocket,
    title: "ERP Core",
    meta: "2–4 semanas",
    num: "02",
    points: ["Módulos essenciais a funcionar", "Permissões e rastreio", "Dashboards + dados centrais"],
  },
  {
    icon: Sparkles,
    title: "IA Gemini",
    meta: "1–2 semanas",
    num: "03",
    points: ["Leitura de docs (PDF/email)", "Assistente + automações", "Resumos e triagens"],
  },
  {
    icon: CheckCircle2,
    title: "Evolução",
    meta: "mensal",
    num: "04",
    points: ["Melhorias e integrações", "KPIs e redução de erros", "Prioridades do negócio"],
  },
];

export function Process() {
  return (
    <Section
      id="processo"
      eyebrow="Como trabalhamos"
      title="Sprints rápidos. Resultados reais."
      subtitle="Resultados rápidos, risco baixo, evolução constante."
    >
      {/* Timeline */}
      <div className="relative">
        {/* Connecting line (desktop) */}
        <div className="absolute left-0 right-0 top-14 hidden h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent lg:block" />

        <div className="grid gap-4 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08} variant="blur-up">
              <div className="group relative h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-400 hover:border-white/[0.1] hover:bg-white/[0.04]">
                {/* Step number */}
                <div className="absolute -top-3 right-4 rounded-full bg-ink-950 px-2 text-[11px] font-bold text-white/20">
                  {s.num}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-xl bg-white/[0.04] p-2.5 transition-transform duration-300 group-hover:scale-110">
                    <s.icon size={16} className="text-white/70" />
                  </div>
                  <div className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/40">{s.meta}</div>
                </div>
                <div className="mt-4 text-sm font-semibold">{s.title}</div>
                <ul className="mt-3 grid gap-1.5 text-[13px] text-white/50">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-indigo-400/40" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.4} variant="fade">
        <div className="mt-10 glass rounded-2xl p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-sm font-semibold">O que recebes no diagnóstico</div>
              <p className="mt-2 text-sm text-white/50">
                3 gargalos + 3 automações com IA + proposta de sprint com prazo e investimento.
              </p>
            </div>
            <a
              href="#form"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-ink-950 transition-all duration-300 hover:bg-white/90 hover:shadow-glow-sm active:scale-[0.98]"
            >
              Pedir Diagnóstico
            </a>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
