import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../lib/cn";
import { useActiveSection } from "../hooks/useActiveSection";
import { Button } from "./Button";
import { Container } from "./Container";
import { Logo } from "./Logo";

const NAV = [
  { id: "solucao", label: "Solução" },
  { id: "features", label: "Módulos" },
  { id: "processo", label: "Processo" },
  { id: "casos", label: "Casos" },
  { id: "faq", label: "FAQ" },
];

export function Navbar({ onCta }: { onCta: () => void }) {
  const ids = useMemo(() => NAV.map((n) => n.id), []);
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const linkClass = (id: string) =>
    cn(
      "relative text-sm text-white/60 hover:text-white transition-colors duration-300",
      active === id && "text-white"
    );

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled ? "border-b border-white/5 bg-ink-950/80 backdrop-blur-2xl" : "bg-transparent"
      )}
    >
      <Container className="py-3">
        <div className="flex items-center justify-between gap-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-3"
          >
            <Logo className="h-9 w-auto" />
            <div className="hidden sm:block">
              <div className="text-sm font-semibold leading-none">NextOps AI</div>
              <div className="mt-1 text-[11px] text-white/50">Processos claros. Decisões rápidas.</div>
            </div>
          </a>

          <div className="hidden items-center gap-7 lg:flex">
            {NAV.map((n) => (
              <button key={n.id} className={linkClass(n.id)} onClick={() => go(n.id)}>
                {n.label}
                {active === n.id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="hidden sm:inline-flex"
              onClick={() => go("form")}
            >
              Diagnóstico
            </Button>
            <Button className="hidden lg:inline-flex" onClick={onCta}>
              Falar connosco
            </Button>

            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden lg:hidden"
            >
              <div className="mt-3 glass-strong rounded-2xl p-3">
                <div className="grid gap-1">
                  {NAV.map((n, i) => (
                    <motion.button
                      key={n.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl px-4 py-3 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                      onClick={() => go(n.id)}
                    >
                      {n.label}
                    </motion.button>
                  ))}
                </div>
                <div className="mt-2 grid gap-2">
                  <Button size="sm" onClick={() => { setOpen(false); go("form"); }} className="w-full justify-center">
                    Pedir Diagnóstico
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}
