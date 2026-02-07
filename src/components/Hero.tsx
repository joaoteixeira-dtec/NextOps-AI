import { motion, useScroll, useTransform, useInView, animate } from "framer-motion";
import { ArrowRight, Bot, Gauge, Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { Container } from "./Container";
import { LeadForm } from "./LeadForm";
import { useReducedMotion } from "../hooks/useReducedMotion";

/* ── Animated counter ── */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, target, {
      duration: 1.8,
      ease: [0.32, 0.72, 0, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [inView, target]);

  return <span ref={ref}>{value}{suffix}</span>;
}

/* ── Word-by-word text reveal ── */
function AnimatedWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: delay + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block mr-[0.28em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0px", "0px"] : ["0px", "100px"]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduced ? ["0px", "0px"] : ["0px", "-80px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const scrollToForm = () => {
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const el = document.querySelector("#form input") as HTMLInputElement | null;
      el?.focus();
    }, 650);
  };

  return (
    <div ref={ref} className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">

          {/* ── Left column ── */}
          <motion.div style={{ opacity }} className="relative">

            {/* Floating badge */}
            <motion.div
              style={{ y: y2 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -left-4 -top-6 hidden lg:block"
            >
              <div className="floating glass-strong rounded-2xl px-4 py-2.5 shadow-glow-sm">
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Diagnóstico em 48h
                </div>
              </div>
            </motion.div>

            {/* Heading */}
            <h1 className="mt-4 text-balance text-[2.25rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.35rem]">
              <AnimatedWords text="A tua operação," />
              <br />
              <span className="text-shimmer">
                <AnimatedWords text="centralizada e inteligente." delay={0.2} />
              </span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-white/65 sm:text-lg"
            >
              ERP modular com IA Gemini. Menos erros, mais visibilidade — implementado por sprints.
            </motion.p>

            {/* Chips */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-5 flex flex-wrap gap-2"
            >
              <Chip className="gap-1.5"><Layers size={13} /> ERP modular</Chip>
              <Chip className="gap-1.5"><Bot size={13} /> Gemini IA</Chip>
              <Chip className="gap-1.5"><Gauge size={13} /> Resultados reais</Chip>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button size="lg" onClick={scrollToForm} className="group justify-center">
                Pedir Diagnóstico
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => document.getElementById("solucao")?.scrollIntoView({ behavior: "smooth" })}
                className="justify-center"
              >
                Ver como funciona
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div style={{ y }} className="mt-10 grid grid-cols-3 gap-3">
              <StatCard value={<><CountUp target={35} suffix="%" /></>} label="menos tarefas repetitivas" prefix="−" />
              <StatCard value={<><CountUp target={50} suffix="%" /></>} label="menos erros operacionais" prefix="−" />
              <StatCard value={<>Tempo real</>} label="visibilidade da operação" />
            </motion.div>

            {/* Industries bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-6 glass rounded-2xl p-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/50">
                <span className="uppercase tracking-[0.2em]">Indicado para</span>
                <span>Distribuição · Serviços · Armazéns · Backoffice</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right column — Form ── */}
          <div id="form" className="relative scroll-mt-28 lg:mt-4">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <LeadForm />
            </motion.div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function StatCard({ value, label, prefix }: { value: React.ReactNode; label: string; prefix?: string }) {
  return (
    <div className="glass hover-glow rounded-2xl p-4 transition-smooth">
      <div className="text-xl font-bold sm:text-2xl">{prefix}{value}</div>
      <div className="mt-1 text-xs text-white/55 sm:text-sm">{label}</div>
    </div>
  );
}
