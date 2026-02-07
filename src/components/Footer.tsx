import { Container } from "./Container";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <Container>
        <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-auto" />
            <div>
              <div className="text-sm font-semibold">NextOps AI</div>
              <div className="text-xs text-white/55">Processos claros. Decisões rápidas.</div>
            </div>
          </div>
          <div className="text-sm text-white/55 sm:text-right">
            © {new Date().getFullYear()} NextOps AI. Todos os direitos reservados.
          </div>
        </div>
      </Container>
    </footer>
  );
}
