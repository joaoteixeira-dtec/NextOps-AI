import { Building2, Car, PackageSearch, Wrench } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { TiltCard } from "../components/TiltCard";

const cases = [
  {
    icon: PackageSearch,
    title: "Distribuição",
    bullets: ["Encomendas + stock", "Rotas e confirmações", "Ruturas e reposição"],
    accent: "from-blue-500/15",
  },
  {
    icon: Wrench,
    title: "Serviços",
    bullets: ["Tarefas e SLAs", "Reporting automático", "Histórico por cliente"],
    accent: "from-emerald-500/15",
  },
  {
    icon: Car,
    title: "Frotas",
    bullets: ["Checklists e estados", "Documentos e danos", "Alertas automáticos"],
    accent: "from-amber-500/15",
  },
  {
    icon: Building2,
    title: "Backoffice",
    bullets: ["Processos e aprovações", "Menos erros manuais", "Dashboards claros"],
    accent: "from-violet-500/15",
  },
];

export function UseCases() {
  return (
    <Section
      id="casos"
      eyebrow="Casos típicos"
      title="Onde ganhamos tempo logo na 1ª semana"
      subtitle="Se a equipa passa o dia a confirmar coisas e procurar informação — há margem."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cases.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.06} variant="blur-up">
            <TiltCard className="h-full">
              <div className="group h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-400 hover:border-white/[0.1] hover:bg-white/[0.04]">
                <div className={`w-fit rounded-xl bg-gradient-to-br ${c.accent} to-transparent p-2.5 transition-transform duration-300 group-hover:scale-110`}>
                  <c.icon size={16} className="text-white/80" />
                </div>
                <div className="mt-4 text-sm font-semibold">{c.title}</div>
                <ul className="mt-3 grid gap-1.5 text-[13px] text-white/50">
                  {c.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-indigo-400/40" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
