import {
  Boxes,
  ClipboardList,
  FileBarChart2,
  FolderKanban,
  GitBranch,
  MessagesSquare,
  Route,
  UsersRound,
  Wand2,
} from "lucide-react";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

const features = [
  { icon: FolderKanban, title: "Pipeline & tarefas", desc: "Estados, prioridades, responsáveis, SLAs e histórico." },
  { icon: Boxes, title: "Produtos & stock", desc: "Ruturas, reposição, entradas/saídas e inventário." },
  { icon: ClipboardList, title: "Encomendas & compras", desc: "Ciclo completo com validações e automações." },
  { icon: UsersRound, title: "Clientes & equipas", desc: "Perfis, permissões, registos e auditoria." },
  { icon: Route, title: "Rotas & operações", desc: "Planeamento, execução e confirmação no terreno." },
  { icon: MessagesSquare, title: "Suporte & tickets", desc: "Triagem e respostas assistidas por IA." },
  { icon: FileBarChart2, title: "Dashboards", desc: "KPIs claros para decisões rápidas." },
  { icon: GitBranch, title: "Integrações", desc: "APIs, webhooks, email, pagamentos, CRMs." },
  { icon: Wand2, title: "IA Gemini", desc: "Resumos, extrações, classificação e automação de texto/dados." },
];

export function Features() {
  return (
    <Section
      id="features"
      eyebrow="Módulos"
      title="Uma base modular — adaptada ao teu processo"
      subtitle="Escolhe o core e evoluímos por sprints. O objetivo é simplicidade operacional e visibilidade total."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.04}>
            <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:bg-white/7">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <f.icon size={18} />
                </div>
                <div className="text-sm font-semibold">{f.title}</div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
