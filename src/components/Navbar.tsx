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

  const linkClass = (id: string) =>
    cn(
      "text-sm text-white/70 hover:text-white transition",
      active === id && "text-white"
    );

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={cn(
        "fixed top-0 z-50 w-full border-b border-white/5",
        scrolled ? "bg-ink-950/75 backdrop-blur-xl" : "bg-transparent"
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
              <div className="mt-1 text-xs text-white/60">Processos claros. Decisões rápidas.</div>
            </div>
          </a>

          <div className="hidden items-center gap-6 lg:flex">
            {NAV.map((n) => (
              <button key={n.id} className={linkClass(n.id)} onClick={() => go(n.id)}>
                {n.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="hidden sm:inline-flex"
              onClick={() => go("form")}
            >
              Pedir Diagnóstico
            </Button>
            <Button className="hidden lg:inline-flex" onClick={onCta}>
              Falar connosco
            </Button>

            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile */}
        {open && (
          <div className="mt-3 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl lg:hidden">
            <div className="grid gap-1">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  className={cn(
                    "rounded-2xl px-3 py-3 text-left text-sm text-white/75 hover:bg-white/10 hover:text-white",
                    active === n.id && "bg-white/10 text-white"
                  )}
                  onClick={() => go(n.id)}
                >
                  {n.label}
                </button>
              ))}
              <button
                className="mt-2 rounded-2xl bg-white px-3 py-3 text-sm font-medium text-ink-950"
                onClick={() => go("form")}
              >
                Pedir Diagnóstico (48h)
              </button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
