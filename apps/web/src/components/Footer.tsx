import { Container } from "./Container";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] py-10">
      <Container>
        <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto opacity-80" />
            <div>
              <div className="text-sm font-semibold">NextOps AI</div>
              <div className="text-[11px] text-white/40">Processos claros. Decisões rápidas.</div>
            </div>
          </div>
          <div className="text-xs text-white/35 sm:text-right">
            © {new Date().getFullYear()} NextOps AI. Todos os direitos reservados.
          </div>
        </div>
      </Container>
    </footer>
  );
}
