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
import type { LucideIcon } from "lucide-react";

const features: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: FolderKanban, title: "Pipeline & tarefas", desc: "Estados, prioridades, SLAs e histórico." },
  { icon: Boxes, title: "Produtos & stock", desc: "Ruturas, reposição e inventário." },
  { icon: ClipboardList, title: "Encomendas", desc: "Ciclo completo com automações." },
  { icon: UsersRound, title: "Clientes & equipas", desc: "Perfis, permissões e auditoria." },
  { icon: Route, title: "Rotas & operações", desc: "Planeamento e confirmação no terreno." },
  { icon: MessagesSquare, title: "Suporte & tickets", desc: "Triagem assistida por IA." },
  { icon: FileBarChart2, title: "Dashboards", desc: "KPIs claros, decisões rápidas." },
  { icon: GitBranch, title: "Integrações", desc: "APIs, webhooks, email, CRMs." },
  { icon: Wand2, title: "IA Gemini", desc: "Resumos, extrações e automação." },
];

export function Features() {
  return (
    <Section
      id="features"
      eyebrow="Módulos"
      title="Módulos que encaixam no teu processo"
      subtitle="Escolhe o core e evoluímos por sprints. Simplicidade operacional e visibilidade total."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.04} variant="blur-up">
            <div
              className="group relative h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-400 hover:border-white/[0.1] hover:bg-white/[0.05]"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
              }}
            >
              {/* Hover spotlight */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-400 group-hover:opacity-100" style={{ background: "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99,102,241,0.06), transparent 40%)" }} />
              <div className="relative flex items-center gap-3">
                <div className="rounded-lg bg-white/[0.04] p-2.5 transition-transform duration-300 group-hover:scale-110">
                  <f.icon size={16} className="text-white/70" />
                </div>
                <div className="text-sm font-semibold">{f.title}</div>
              </div>
              <p className="relative mt-2.5 text-[13px] leading-relaxed text-white/50">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
