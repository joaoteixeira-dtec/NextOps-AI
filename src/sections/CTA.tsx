import { ArrowRight, Sparkles } from "lucide-react";
import { Section } from "../components/Section";

export function CTA() {
  return (
    <Section
      className="py-12"
      eyebrow="Vamos ao essencial"
      title="Queres leads internas e operação sob controlo? Começa pelo diagnóstico."
      subtitle="Recebes um mapa claro com ganhos rápidos e uma proposta de sprint. Sem spam."
    >
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/6 to-white/3 p-6 backdrop-blur-xl">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold">Diagnóstico + Mapa (48h)</div>
              <p className="mt-2 text-sm text-white/70">
                Ideal se tens processos espalhados, erros operacionais ou falta de visibilidade do estado real.
              </p>
            </div>
          </div>
          <a
            href="#form"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-semibold text-ink-950 hover:bg-white/90"
          >
            Pedir agora <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </Section>
  );
}
