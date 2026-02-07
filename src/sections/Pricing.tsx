import { BadgeCheck, Shield, Zap } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

const plans = [
  {
    icon: Zap,
    title: "Diagnóstico (48h)",
    price: "Gratuito",
    desc: "Para saber rapidamente o que automatizar e por onde começar.",
    bullets: ["Mapa de ganhos rápidos", "3 gargalos + 3 automações", "Proposta de sprint (prazo + investimento)"],
    highlight: true,
  },
  {
    icon: BadgeCheck,
    title: "ERP Core",
    price: "Sprint 2–4 semanas",
    desc: "O essencial a funcionar e a equipa alinhada num sistema único.",
    bullets: ["Módulos core", "Permissões e auditoria", "Dashboards e exports"],
  },
  {
    icon: Shield,
    title: "ERP + IA (Gemini)",
    price: "Sprint 1–2 semanas",
    desc: "Automação real e redução de trabalho repetitivo com guardrails.",
    bullets: ["Leitura de docs", "Assistente interno", "Triagem/Resumos/Preenchimento"],
  },
];

export function Pricing() {
  return (
    <Section
      eyebrow="Oferta"
      title="Começa simples. Evolui rápido."
      subtitle="A porta de entrada é o diagnóstico. Depois, implementamos por sprints — sem surpresas."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.05}>
            <div
              className={[
                "h-full rounded-3xl border bg-white/5 p-6 backdrop-blur-xl",
                p.highlight ? "border-white/20 shadow-glow" : "border-white/10",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p.icon size={18} />
                </div>
                {p.highlight && (
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    Mais pedido
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm font-semibold">{p.title}</div>
              <div className="mt-2 text-2xl font-semibold">{p.price}</div>
              <p className="mt-2 text-sm text-white/70">{p.desc}</p>
              <ul className="mt-4 grid gap-2 text-sm text-white/70">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
                    {b}
                  </li>
                ))}
              </ul>
              <a
                href="#form"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={[
                  "mt-6 inline-flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold transition",
                  p.highlight ? "bg-white text-ink-950 hover:bg-white/90" : "bg-white/10 text-white hover:bg-white/14",
                ].join(" ")}
              >
                Pedir diagnóstico
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-xs text-white/45">
        *Os prazos variam conforme complexidade e integrações. A proposta final é definida no diagnóstico.
      </p>
    </Section>
  );
}
