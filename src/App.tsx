import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Landing } from "./pages/Landing";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./backoffice/components/RequireAuth";
import { BackofficeLayout } from "./backoffice/components/BackofficeLayout";
import { LoginPage } from "./backoffice/pages/LoginPage";

/* Lazy-load backoffice pages for code-splitting */
const DashboardPage = lazy(() => import("./backoffice/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const CRMPage = lazy(() => import("./backoffice/pages/CRMPage").then((m) => ({ default: m.CRMPage })));
const ClientsPage = lazy(() => import("./backoffice/pages/ClientsPage").then((m) => ({ default: m.ClientsPage })));
const ProposalsPage = lazy(() => import("./backoffice/pages/ProposalsPage").then((m) => ({ default: m.ProposalsPage })));
const ProjectsPage = lazy(() => import("./backoffice/pages/ProjectsPage").then((m) => ({ default: m.ProjectsPage })));
const TasksPage = lazy(() => import("./backoffice/pages/TasksPage").then((m) => ({ default: m.TasksPage })));
const InvoicesPage = lazy(() => import("./backoffice/pages/InvoicesPage").then((m) => ({ default: m.InvoicesPage })));
const TeamPage = lazy(() => import("./backoffice/pages/TeamPage").then((m) => ({ default: m.TeamPage })));
const ReportsPage = lazy(() => import("./backoffice/pages/ReportsPage").then((m) => ({ default: m.ReportsPage })));
const PricingSettingsPage = lazy(() => import("./backoffice/pages/PricingSettingsPage").then((m) => ({ default: m.PricingSettingsPage })));
const PublicProposalPage = lazy(() => import("./backoffice/pages/PublicProposalPage").then((m) => ({ default: m.PublicProposalPage })));

function BackofficeLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-ink-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-blue" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<Landing />} />

          {/* ── Backoffice Login (public) ── */}
          <Route path="/backoffice/login" element={<LoginPage />} />

          {/* ── Public proposal share link ── */}
          <Route
            path="/proposta/:token"
            element={<Suspense fallback={<BackofficeLoader />}><PublicProposalPage /></Suspense>}
          />

          {/* ── Protected Backoffice ── */}
          <Route element={<RequireAuth />}>
            <Route element={<BackofficeLayout />}>
              <Route
                path="/backoffice"
                element={<Suspense fallback={<BackofficeLoader />}><DashboardPage /></Suspense>}
              />
              <Route
                path="/backoffice/crm"
                element={<Suspense fallback={<BackofficeLoader />}><CRMPage /></Suspense>}
              />
              <Route
                path="/backoffice/clientes"
                element={<Suspense fallback={<BackofficeLoader />}><ClientsPage /></Suspense>}
              />
              <Route
                path="/backoffice/propostas"
                element={<Suspense fallback={<BackofficeLoader />}><ProposalsPage /></Suspense>}
              />
              <Route
                path="/backoffice/projetos"
                element={<Suspense fallback={<BackofficeLoader />}><ProjectsPage /></Suspense>}
              />
              <Route
                path="/backoffice/tarefas"
                element={<Suspense fallback={<BackofficeLoader />}><TasksPage /></Suspense>}
              />
              <Route
                path="/backoffice/faturacao"
                element={<Suspense fallback={<BackofficeLoader />}><InvoicesPage /></Suspense>}
              />
              <Route
                path="/backoffice/equipa"
                element={<Suspense fallback={<BackofficeLoader />}><TeamPage /></Suspense>}
              />
              <Route
                path="/backoffice/relatorios"
                element={<Suspense fallback={<BackofficeLoader />}><ReportsPage /></Suspense>}
              />
              <Route
                path="/backoffice/definicoes"
                element={<Suspense fallback={<BackofficeLoader />}><PricingSettingsPage /></Suspense>}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
