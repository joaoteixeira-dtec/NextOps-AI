import { Building2, Car, PackageSearch, Wrench } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { TiltCard } from "../components/TiltCard";

const cases = [
  {
    icon: PackageSearch,
    title: "Distribuição / armazém",
    bullets: ["encomendas + stock", "rotas e confirmações", "ruturas e reposição"],
  },
  {
    icon: Wrench,
    title: "Serviços no terreno",
    bullets: ["tarefas e SLAs", "reporting automático", "histórico por cliente"],
  },
  {
    icon: Car,
    title: "Frotas / rent-a-car",
    bullets: ["checklists e estados", "documentos e danos", "reporting e alertas"],
  },
  {
    icon: Building2,
    title: "Backoffice pesado",
    bullets: ["processos e aprovações", "menos erros manuais", "dashboards claros"],
  },
];

export function UseCases() {
  return (
    <Section
      id="casos"
      eyebrow="Casos típicos"
      title="Onde a NextOps AI ganha tempo logo na primeira semana"
      subtitle="Se a tua equipa passa o dia a confirmar coisas e a procurar informação… há margem para automatizar."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cases.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.05}>
            <TiltCard className="h-full">
              <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 w-fit">
                  <c.icon size={18} />
                </div>
                <div className="mt-4 text-sm font-semibold">{c.title}</div>
                <ul className="mt-3 grid gap-2 text-sm text-white/70">
                  {c.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
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
