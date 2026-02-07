import { Bot, FileText, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { TiltCard } from "../components/TiltCard";

const items = [
  {
    icon: LayoutDashboard,
    title: "ERP à medida (base modular)",
    desc: "Começamos com uma base sólida e adaptamos ao teu fluxo real — sem reinventar a roda.",
  },
  {
    icon: Bot,
    title: "Gemini integrado (IA aplicada)",
    desc: "Automatiza triagens, respostas, resumos, preenchimentos e relatórios — com objetivo concreto.",
  },
  {
    icon: FileText,
    title: "Leitura de documentos (PDF/Email)",
    desc: "Extrai dados e cria registos automaticamente: encomendas, faturas, guias, pedidos e tickets.",
  },
  {
    icon: ShieldCheck,
    title: "Controlo + Permissões",
    desc: "Perfis por função, rastreio de ações e visibilidade total do estado da operação em tempo real.",
  },
];

export function Solution() {
  return (
    <Section
      id="solucao"
      eyebrow="O que fazemos"
      title="Tiramos a tua operação do Excel/WhatsApp e colocamos num sistema único — com IA a trabalhar."
      subtitle="Não vendemos 'software'. Implementamos um fluxo que funciona, medimos resultados e evoluímos por sprints."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((it, idx) => (
          <Reveal key={it.title} delay={idx * 0.05}>
            <TiltCard className="h-full">
              <div className="gradient-border h-full rounded-3xl bg-white/5 p-1">
                <div className="h-full rounded-[1.35rem] border border-white/5 bg-ink-900/45 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <it.icon size={18} />
                    </div>
                    <div className="text-base font-semibold">{it.title}</div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{it.desc}</p>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <div className="text-sm font-semibold">Promessa clara</div>
            <p className="mt-2 text-sm text-white/70">
              Recuperar tempo, reduzir erros e dar visibilidade real — sem projetos infinitos.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold">Modelo por sprints</div>
            <p className="mt-2 text-sm text-white/70">
              Entregas semana a semana. O teu negócio não pode parar — nós também não.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold">IA com objetivo</div>
            <p className="mt-2 text-sm text-white/70">
              “Automatizar o que é repetitivo” + “responder e organizar dados” — nada de magia.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
