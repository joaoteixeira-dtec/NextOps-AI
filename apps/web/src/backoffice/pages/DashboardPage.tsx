import { useEffect, useState } from "react";
import { collection, query, getDocs, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { TopBar } from "../components/TopBar";
import type { Lead, Client, Proposal, Project, Task, Invoice, ActivityLog } from "../../lib/types";
import {
  Users,
  Building2,
  FileText,
  FolderKanban,
  Receipt,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import { cn } from "../../lib/cn";

type KPI = {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  color: string;
};

export function DashboardPage() {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [leadsSnap, clientsSnap, proposalsSnap, projectsSnap, tasksSnap, invoicesSnap, activitySnap] =
          await Promise.all([
            getDocs(collection(db, "leads")),
            getDocs(collection(db, "clients")),
            getDocs(collection(db, "proposals")),
            getDocs(collection(db, "projects")),
            getDocs(collection(db, "tasks")),
            getDocs(collection(db, "invoices")),
            getDocs(query(collection(db, "activity_log"), orderBy("timestamp", "desc"), limit(10))),
          ]);

        setLeads(leadsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Lead)));
        setClients(clientsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Client)));
        setProposals(proposalsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Proposal)));
        setProjects(projectsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Project)));
        setTasks(tasksSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Task)));
        setInvoices(invoicesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice)));
        setActivity(activitySnap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog)));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const activeLeads = leads.filter((l) => !["ganho", "perdido"].includes(l.status));
  const wonLeads = leads.filter((l) => l.status === "ganho");
  const pipelineValue = leads
    .filter((l) => !["ganho", "perdido"].includes(l.status))
    .reduce((sum, l) => sum + (l.value ?? 0), 0);
  const totalRevenue = invoices
    .filter((i) => i.status === "paga")
    .reduce((sum, i) => sum + i.total, 0);
  const activeProjects = projects.filter((p) => p.status !== "concluido");
  const pendingTasks = tasks.filter((t) => t.status !== "concluida" && t.status !== "cancelada");
  const pendingInvoices = invoices.filter((i) => i.status === "emitida" || i.status === "vencida");

  const kpis: KPI[] = [
    {
      label: "Leads Ativas",
      value: activeLeads.length,
      icon: <Users size={20} />,
      color: "from-accent-blue to-accent-cyan",
    },
    {
      label: "Clientes",
      value: clients.length,
      icon: <Building2 size={20} />,
      color: "from-accent-emerald to-accent-cyan",
    },
    {
      label: "Propostas Abertas",
      value: proposals.filter((p) => p.status === "enviada").length,
      icon: <FileText size={20} />,
      color: "from-accent-violet to-accent-fuchsia",
    },
    {
      label: "Projetos Ativos",
      value: activeProjects.length,
      icon: <FolderKanban size={20} />,
      color: "from-accent-blue to-accent-violet",
    },
    {
      label: "Pipeline (€)",
      value: pipelineValue.toLocaleString("pt-PT") + " €",
      icon: <TrendingUp size={20} />,
      color: "from-accent-emerald to-accent-blue",
    },
    {
      label: "Faturado (€)",
      value: totalRevenue.toLocaleString("pt-PT") + " €",
      icon: <Receipt size={20} />,
      color: "from-accent-cyan to-accent-emerald",
    },
  ];

  const ACTION_LABELS: Record<string, string> = {
    lead_created: "Nova lead criada",
    lead_updated: "Lead atualizada",
    lead_status_changed: "Estado da lead alterado",
    client_created: "Novo cliente criado",
    client_updated: "Cliente atualizado",
    proposal_created: "Proposta criada",
    proposal_sent: "Proposta enviada",
    proposal_accepted: "Proposta aceite",
    proposal_rejected: "Proposta recusada",
    project_created: "Projeto criado",
    project_status_changed: "estado do projeto alterado",
    task_created: "Tarefa criada",
    task_completed: "Tarefa concluída",
    invoice_created: "Fatura criada",
    invoice_paid: "Fatura paga",
    user_login: "Login efetuado",
  };

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold">
            Olá, {profile?.name?.split(" ")[0]} 👋
          </h2>
          <p className="mt-1 text-sm text-white/40">
            Aqui está o resumo do teu negócio.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-blue" />
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="group rounded-2xl border border-white/5 bg-ink-900/40 p-5 backdrop-blur transition-all hover:border-white/10 hover:bg-ink-900/60"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-white/40 uppercase tracking-wider">
                        {kpi.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
                    </div>
                    <div
                      className={cn(
                        "rounded-xl bg-gradient-to-br p-2.5 text-white/90",
                        kpi.color
                      )}
                    >
                      {kpi.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Pipeline Funnel */}
              <div className="rounded-2xl border border-white/5 bg-ink-900/40 p-6 backdrop-blur">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
                  Funil de Vendas
                </h3>
                <div className="space-y-3">
                  {(
                    [
                      { label: "Novo", key: "novo", color: "bg-white/20" },
                      { label: "Contactado", key: "contactado", color: "bg-accent-cyan/50" },
                      { label: "Qualificado", key: "qualificado", color: "bg-accent-blue/50" },
                      { label: "Proposta", key: "proposta", color: "bg-accent-violet/50" },
                      { label: "Negociação", key: "negociacao", color: "bg-accent-fuchsia/50" },
                      { label: "Ganho", key: "ganho", color: "bg-accent-emerald/50" },
                      { label: "Perdido", key: "perdido", color: "bg-red-500/50" },
                    ] as const
                  ).map((stage) => {
                    const count = leads.filter((l) => l.status === stage.key).length;
                    const pct = leads.length > 0 ? (count / leads.length) * 100 : 0;
                    return (
                      <div key={stage.key} className="flex items-center gap-3">
                        <span className="w-24 text-xs text-white/50 shrink-0">{stage.label}</span>
                        <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden">
                          <div
                            className={cn("h-full rounded-lg transition-all", stage.color)}
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl border border-white/5 bg-ink-900/40 p-6 backdrop-blur">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
                  Atividade Recente
                </h3>
                {activity.length === 0 ? (
                  <p className="text-sm text-white/30 py-8 text-center">
                    Sem atividade registada ainda.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activity.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-start gap-3 rounded-xl bg-white/[0.02] p-3"
                      >
                        <div className="mt-0.5 rounded-full bg-accent-blue/10 p-1.5 text-accent-blue">
                          <Clock size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{a.userName}</span>{" "}
                            <span className="text-white/50">
                              {ACTION_LABELS[a.action] ?? a.action}
                            </span>
                            {a.entityName && (
                              <span className="text-accent-blue"> {a.entityName}</span>
                            )}
                          </p>
                          <p className="text-[10px] text-white/30 mt-0.5">
                            {new Date(a.timestamp).toLocaleString("pt-PT")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Tasks */}
              <div className="rounded-2xl border border-white/5 bg-ink-900/40 p-6 backdrop-blur">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
                  Tarefas Pendentes ({pendingTasks.length})
                </h3>
                {pendingTasks.length === 0 ? (
                  <p className="text-sm text-white/30 py-8 text-center">
                    Sem tarefas pendentes. 🎉
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingTasks.slice(0, 5).map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{t.title}</p>
                          {t.linkedName && (
                            <p className="text-[10px] text-white/30">{t.linkedName}</p>
                          )}
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            t.priority === "urgente" && "bg-red-500/15 text-red-400",
                            t.priority === "alta" && "bg-orange-500/15 text-orange-400",
                            t.priority === "media" && "bg-accent-blue/15 text-accent-blue",
                            t.priority === "baixa" && "bg-white/10 text-white/40"
                          )}
                        >
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invoices Summary */}
              <div className="rounded-2xl border border-white/5 bg-ink-900/40 p-6 backdrop-blur">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
                  Faturação
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-accent-emerald/5 border border-accent-emerald/10 p-4">
                    <p className="text-xs text-accent-emerald/70">Total Faturado</p>
                    <p className="mt-1 text-xl font-bold text-accent-emerald">
                      {totalRevenue.toLocaleString("pt-PT")} €
                    </p>
                  </div>
                  <div className="rounded-xl bg-orange-500/5 border border-orange-500/10 p-4">
                    <p className="text-xs text-orange-400/70">Por Cobrar</p>
                    <p className="mt-1 text-xl font-bold text-orange-400">
                      {pendingInvoices.reduce((s, i) => s + i.total, 0).toLocaleString("pt-PT")} €
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
