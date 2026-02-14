import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff, LogIn } from "lucide-react";

export function LoginPage() {
  const { user, profile, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-accent-blue" />
      </div>
    );
  }

  if (user && profile) {
    return <Navigate to="/backoffice" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Email ou palavra-passe incorretos.");
      } else if (code === "auth/too-many-requests") {
        setError("Demasiadas tentativas. Tenta novamente mais tarde.");
      } else {
        setError("Erro ao iniciar sessão. Tenta novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-accent-blue/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent-violet/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <img
            src="/nextopsai-logo-1.png"
            alt="NextOps AI"
            className="mb-4 h-14 w-14 rounded-2xl"
          />
          <h1 className="text-2xl font-bold">NextOps AI</h1>
          <p className="mt-1 text-sm text-white/40">Backoffice — Área Restrita</p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/5 bg-ink-900/60 backdrop-blur-xl p-8 space-y-5"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@nextopsai.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30 transition-colors"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">
              Palavra-passe
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/25 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-blue py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <LogIn size={16} />
                Entrar
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/20">
          © {new Date().getFullYear()} NextOps AI — Acesso exclusivo a colaboradores
        </p>
      </div>
    </div>
  );
}
