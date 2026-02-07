import { BadgeCheck, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

const plans = [
  {
    icon: Zap,
    title: "Diagnóstico",
    price: "Gratuito",
    desc: "Saber o que automatizar e por onde começar.",
    bullets: ["Mapa de ganhos rápidos", "3 gargalos + 3 automações", "Proposta de sprint"],
    highlight: true,
  },
  {
    icon: BadgeCheck,
    title: "ERP Core",
    price: "2–4 semanas",
    desc: "O essencial a funcionar, equipa alinhada.",
    bullets: ["Módulos core", "Permissões e auditoria", "Dashboards e exports"],
  },
  {
    icon: Shield,
    title: "ERP + IA",
    price: "1–2 semanas",
    desc: "Automação real, menos trabalho repetitivo.",
    bullets: ["Leitura de docs", "Assistente interno", "Triagem e resumos"],
  },
];

export function Pricing() {
  return (
    <Section
      eyebrow="Oferta"
      title="Começa simples. Evolui rápido."
      subtitle="A porta de entrada é o diagnóstico. Implementamos por sprints — sem surpresas."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.06} variant="blur-up">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={[
                "relative h-full rounded-2xl border p-6 transition-colors duration-400",
                p.highlight
                  ? "border-indigo-400/20 bg-gradient-to-b from-indigo-500/[0.06] to-transparent shadow-glow-sm"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]",
              ].join(" ")}
            >
              {p.highlight && (
                <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-3 py-0.5 text-[11px] font-semibold text-white">
                  Mais pedido
                </div>
              )}
              <div className="flex items-start justify-between gap-3">
                <div className={`rounded-xl p-2.5 ${p.highlight ? "bg-indigo-500/15" : "bg-white/[0.04]"}`}>
                  <p.icon size={16} className={p.highlight ? "text-indigo-300" : "text-white/60"} />
                </div>
              </div>
              <div className="mt-4 text-sm font-semibold">{p.title}</div>
              <div className="mt-1 text-xl font-bold">{p.price}</div>
              <p className="mt-2 text-[13px] text-white/50">{p.desc}</p>
              <ul className="mt-4 grid gap-1.5 text-[13px] text-white/50">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-indigo-400/40" />
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
                  "mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 active:scale-[0.98]",
                  p.highlight
                    ? "bg-white text-ink-950 hover:bg-white/90 hover:shadow-glow-sm"
                    : "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]",
                ].join(" ")}
              >
                Pedir diagnóstico
              </a>
            </motion.div>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-[11px] text-white/30">
        *Prazos variam conforme complexidade. A proposta final é definida no diagnóstico.
      </p>
    </Section>
  );
}
