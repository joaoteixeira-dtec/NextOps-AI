import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { TopBar } from "../components/TopBar";
import type { Lead, Client, Proposal, Project, Invoice } from "../../lib/types";
import { cn } from "../../lib/cn";

export function ReportsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const [lSnap, cSnap, pSnap, prSnap, iSnap] = await Promise.all([
          getDocs(query(collection(db, "leads"), orderBy("createdAt", "desc"))),
          getDocs(collection(db, "clients")),
          getDocs(collection(db, "proposals")),
          getDocs(collection(db, "projects")),
          getDocs(query(collection(db, "invoices"), orderBy("createdAt", "desc"))),
        ]);
        setLeads(lSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Lead)));
        setClients(cSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Client)));
        setProposals(pSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Proposal)));
        setProjects(prSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Project)));
        setInvoices(iSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetch();
  }, []);

  // Metrics
  const wonLeads = leads.filter((l) => l.status === "ganho").length;
  const lostLeads = leads.filter((l) => l.status === "perdido").length;
  const conversionRate = leads.length > 0 ? ((wonLeads / leads.length) * 100).toFixed(1) : "0";

  const acceptedProposals = proposals.filter((p) => p.status === "aceite");
  const totalProposalValue = acceptedProposals.reduce((s, p) => s + p.total, 0);

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.filter((i) => i.status === "paga").reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter((i) => ["emitida", "vencida"].includes(i.status)).reduce((s, i) => s + i.total, 0);

  const activeProjects = projects.filter((p) => p.status !== "concluido").length;
  const completedProjects = projects.filter((p) => p.status === "concluido").length;

  // Monthly revenue (last 6 months)
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleDateString("pt-PT", { month: "short", year: "2-digit" });
    const year = d.getFullYear();
    const m = d.getMonth();
    const total = invoices
      .filter((inv) => {
        const id = new Date(inv.issuedAt);
        return id.getFullYear() === year && id.getMonth() === m && inv.status === "paga";
      })
      .reduce((s, inv) => s + inv.total, 0);
    return { month, total };
  }).reverse();

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.total), 1);

  // Leads by industry
  const industryMap = new Map<string, number>();
  leads.forEach((l) => {
    const ind = l.industry || "Outro";
    industryMap.set(ind, (industryMap.get(ind) ?? 0) + 1);
  });
  const industries = [...industryMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <>
      <TopBar title="Relatórios" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-blue" /></div>
        ) : (
          <>
            {/* KPI Summary */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
              {[
                { label: "Taxa de Conversão", value: `${conversionRate}%`, sub: `${wonLeads} ganhas de ${leads.length}` },
                { label: "Propostas Aceites", value: acceptedProposals.length.toString(), sub: `${totalProposalValue.toLocaleString("pt-PT")} € em valor` },
                { label: "Receita Total", value: `${totalPaid.toLocaleString("pt-PT")} €`, sub: `${totalPending.toLocaleString("pt-PT")} € pendente` },
                { label: "Projetos", value: `${activeProjects} ativos`, sub: `${completedProjects} concluídos` },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border border-white/5 bg-ink-900/40 p-5 backdrop-blur">
                  <p className="text-xs text-white/40 uppercase tracking-wider">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
                  <p className="mt-1 text-[10px] text-white/30">{kpi.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Revenue Chart */}
              <div className="rounded-2xl border border-white/5 bg-ink-900/40 p-6 backdrop-blur">
                <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white/50">Receita Mensal (últimos 6 meses)</h3>
                <div className="flex items-end gap-3 h-40">
                  {monthlyRevenue.map((m) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] text-white/40">{m.total > 0 ? `${(m.total / 1000).toFixed(1)}k` : "0"}</span>
                      <div className="w-full rounded-t-lg bg-accent-blue/20 transition-all" style={{ height: `${Math.max((m.total / maxRevenue) * 100, 4)}%` }}>
                        <div className="h-full w-full rounded-t-lg bg-gradient-to-t from-accent-blue/50 to-accent-blue/20" />
                      </div>
                      <span className="text-[10px] text-white/30">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pipeline Funnel */}
              <div className="rounded-2xl border border-white/5 bg-ink-900/40 p-6 backdrop-blur">
                <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white/50">Funil de Conversão</h3>
                <div className="space-y-3">
                  {[
                    { label: "Total Leads", value: leads.length, pct: 100, color: "bg-white/20" },
                    { label: "Contactadas", value: leads.filter((l) => l.status !== "novo").length, pct: leads.length ? (leads.filter((l) => l.status !== "novo").length / leads.length) * 100 : 0, color: "bg-accent-cyan/40" },
                    { label: "Qualificadas", value: leads.filter((l) => ["qualificado", "proposta", "negociacao", "ganho"].includes(l.status)).length, pct: leads.length ? (leads.filter((l) => ["qualificado", "proposta", "negociacao", "ganho"].includes(l.status)).length / leads.length) * 100 : 0, color: "bg-accent-blue/40" },
                    { label: "Com Proposta", value: leads.filter((l) => ["proposta", "negociacao", "ganho"].includes(l.status)).length, pct: leads.length ? (leads.filter((l) => ["proposta", "negociacao", "ganho"].includes(l.status)).length / leads.length) * 100 : 0, color: "bg-accent-violet/40" },
                    { label: "Ganhas", value: wonLeads, pct: leads.length ? (wonLeads / leads.length) * 100 : 0, color: "bg-accent-emerald/40" },
                  ].map((stage) => (
                    <div key={stage.label} className="flex items-center gap-3">
                      <span className="w-28 text-xs text-white/50 shrink-0">{stage.label}</span>
                      <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden">
                        <div className={cn("h-full rounded-lg transition-all", stage.color)} style={{ width: `${Math.max(stage.pct, 2)}%` }} />
                      </div>
                      <span className="text-xs font-medium w-8 text-right">{stage.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div className="rounded-2xl border border-white/5 bg-ink-900/40 p-6 backdrop-blur">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">Leads por Setor</h3>
                <div className="space-y-2">
                  {industries.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-2.5">
                      <span className="text-sm">{name}</span>
                      <span className="text-sm font-medium text-accent-blue">{count}</span>
                    </div>
                  ))}
                  {industries.length === 0 && <p className="text-sm text-white/30 text-center py-4">Sem dados.</p>}
                </div>
              </div>

              {/* Invoice Health */}
              <div className="rounded-2xl border border-white/5 bg-ink-900/40 p-6 backdrop-blur">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">Saúde de Faturação</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white/[0.03] p-4 text-center">
                    <p className="text-xs text-white/40">Faturas Emitidas</p>
                    <p className="text-2xl font-bold mt-1">{invoices.length}</p>
                  </div>
                  <div className="rounded-xl bg-accent-emerald/5 p-4 text-center">
                    <p className="text-xs text-accent-emerald/60">Taxa de Cobrança</p>
                    <p className="text-2xl font-bold text-accent-emerald mt-1">
                      {totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-orange-500/5 p-4 text-center">
                    <p className="text-xs text-orange-400/60">Vencidas</p>
                    <p className="text-2xl font-bold text-orange-400 mt-1">
                      {invoices.filter((i) => i.status === "vencida").length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-4 text-center">
                    <p className="text-xs text-white/40">Valor Médio</p>
                    <p className="text-2xl font-bold mt-1">
                      {invoices.length > 0 ? (totalInvoiced / invoices.length).toLocaleString("pt-PT", { maximumFractionDigits: 0 }) : 0} €
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
