import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function RequireAuth() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-accent-blue" />
          <p className="text-sm text-white/50">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/backoffice/login" replace />;
  }

  if (!profile.active) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-950">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Conta desativada</h2>
          <p className="text-white/60 text-sm">
            A tua conta foi desativada. Contacta o administrador.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
