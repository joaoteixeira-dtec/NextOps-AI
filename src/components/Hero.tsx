import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Bot, Gauge, Layers, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { Container } from "./Container";
import { LeadForm } from "./LeadForm";
import { Logo } from "./Logo";
import { cn } from "../lib/cn";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0px", "0px"] : ["0px", "80px"]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduced ? ["0px", "0px"] : ["0px", "-60px"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.25]);

  const scrollToForm = () => {
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const el = document.querySelector("#form input") as HTMLInputElement | null;
      el?.focus();
    }, 650);
  };

  return (
    <div ref={ref} className="relative pt-24 sm:pt-28">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative">
            <motion.div style={{ y: y2, opacity }} className="absolute -left-6 -top-8 hidden lg:block">
              <div className="floating rounded-3xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <Sparkles size={16} />
                  Diagnóstico + Mapa (48h)
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
            
              <div className="text-sm font-semibold tracking-wide text-white/80">NextOps AI</div>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <div className="text-sm text-white/60">Processos claros. Decisões rápidas.</div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-6 text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl"
            >
              O teu <span className="bg-gradient-to-r from-blue-400 via-emerald-300 to-fuchsia-300 bg-clip-text text-transparent">ERP à medida</span>, com IA integrada, para pôr a operação sob controlo.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg"
            >
              Centraliza processos, reduz erros e ganha visibilidade em tempo real. Implementação por sprints — rápido, claro e com resultados mensuráveis.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.14 }}
              className="mt-6 flex flex-wrap gap-2"
            >
              <Chip className="gap-2"><Layers size={14} /> ERP modular</Chip>
              <Chip className="gap-2"><Bot size={14} /> Gemini integrado</Chip>
              <Chip className="gap-2"><Gauge size={14} /> Menos tempo e erros</Chip>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button size="lg" onClick={scrollToForm} className="justify-center">
                Pedir Diagnóstico (48h) <ArrowRight size={18} />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => document.getElementById("solucao")?.scrollIntoView({ behavior: "smooth" })}
                className="justify-center"
              >
                Ver como funciona
              </Button>
              <div className="text-xs text-white/55 sm:ml-2">
                Sem compromisso • Focado em B2B
              </div>
            </motion.div>

            <motion.div style={{ y }} className="mt-10 grid gap-3 sm:grid-cols-3">
              <Stat kpi="−35%" label="menos tarefas repetitivas" />
              <Stat kpi="−50%" label="menos erros operacionais" />
              <Stat kpi="+Visão" label="estado real em tempo real" />
            </motion.div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
                <span className="uppercase tracking-[0.22em]">Indicado para</span>
                <span className="text-white/55">Distribuição • Serviços no terreno • Armazéns • Backoffice pesado</span>
              </div>
            </div>
          </div>

          <div id="form" className={cn("relative scroll-mt-28 lg:mt-6")}>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12 }}
            >
              <LeadForm />
            </motion.div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function Stat({ kpi, label }: { kpi: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="text-2xl font-semibold">{kpi}</div>
      <div className="mt-1 text-sm text-white/65">{label}</div>
    </div>
  );
}
