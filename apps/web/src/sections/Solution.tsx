import { Bot, FileText, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { TiltCard } from "../components/TiltCard";

const items = [
  {
    icon: LayoutDashboard,
    title: "ERP modular",
    desc: "Base sólida, adaptada ao teu fluxo real. Sem reinventar a roda.",
    gradient: "from-indigo-500/20 to-indigo-500/5",
  },
  {
    icon: Bot,
    title: "IA Gemini integrada",
    desc: "Automatiza triagens, resumos, preenchimentos e relatórios com objetivo.",
    gradient: "from-cyan-500/20 to-cyan-500/5",
  },
  {
    icon: FileText,
    title: "Leitura de documentos",
    desc: "Extrai dados de PDFs e emails. Cria registos automaticamente.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    icon: ShieldCheck,
    title: "Controlo total",
    desc: "Perfis por função, rastreio de ações e visibilidade em tempo real.",
    gradient: "from-violet-500/20 to-violet-500/5",
  },
];

export function Solution() {
  return (
    <Section
      id="solucao"
      eyebrow="O que fazemos"
      title="Do caos ao controlo — com IA aplicada"
      subtitle="Implementamos um fluxo que funciona, medimos resultados e evoluímos por sprints."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((it, idx) => (
          <Reveal key={it.title} delay={idx * 0.06} variant="blur-up">
            <TiltCard className="h-full">
              <div className="group h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-[1px] transition-all duration-500 hover:border-white/[0.1] hover:bg-white/[0.04]">
                <div className="h-full rounded-[calc(1rem-1px)] p-6">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl bg-gradient-to-br ${it.gradient} p-3 transition-transform duration-300 group-hover:scale-110`}>
                      <it.icon size={18} className="text-white/90" />
                    </div>
                    <div className="text-[15px] font-semibold">{it.title}</div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{it.desc}</p>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3} variant="fade">
        <div className="mt-10 glass rounded-2xl p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { t: "Promessa clara", d: "Recuperar tempo, reduzir erros, visibilidade real." },
              { t: "Modelo por sprints", d: "Entregas semanais. O negócio não para — nós também não." },
              { t: "IA com objetivo", d: "Automatizar o repetitivo, organizar dados — sem magia." },
            ].map((item) => (
              <div key={item.t}>
                <div className="text-sm font-semibold">{item.t}</div>
                <p className="mt-2 text-sm text-white/50">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
