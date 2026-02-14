import { useEffect, useState, useMemo } from "react";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  orderBy, query,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { hasPermission } from "../../lib/permissions";
import { TopBar } from "../components/TopBar";
import type {
  Proposal, ProposalStatus, ProposalComment, ProposalVersion,
  Client, ProductKey, CompanyProfile, PaymentTerms, ProposalItem,
  Project, Invoice,
} from "../../lib/types";
import { cn } from "../../lib/cn";
import {
  Plus, Search, X, ChevronRight, ChevronLeft, Download,
  CheckCircle2, Boxes, Wand2, Puzzle, Search as SearchIcon,
  Copy, Trash2, FolderKanban, Receipt, MessageSquare, History,
  Link2, Filter, AlertTriangle, Clock, TrendingUp, Edit3, Send,
  BarChart3, CalendarDays,
} from "lucide-react";
import {
  PRODUCTS as DEFAULT_PRODUCTS, SECTORS, EMPLOYEE_RANGES, REVENUE_RANGES,
  INTERESTS, DEPARTMENTS, PAYMENT_OPTIONS,
} from "../../lib/pricingEngine";
import { generateProposalPDF, buildProposalDocument } from "../../lib/proposalTemplates";
import { usePricingConfig, type LivePricingData } from "../../hooks/usePricingConfig";

/* ════════════════════════════════════════════════════════════════
   Constants
   ════════════════════════════════════════════════════════════════ */
const STATUS_MAP: Record<ProposalStatus, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-white/10 text-white/50" },
  enviada: { label: "Enviada", color: "bg-accent-blue/15 text-accent-blue" },
  aceite: { label: "Aceite", color: "bg-accent-emerald/15 text-accent-emerald" },
  recusada: { label: "Recusada", color: "bg-red-500/15 text-red-400" },
};

const PRODUCT_ICONS: Record<string, typeof Boxes> = {
  Search: SearchIcon,
  Boxes: Boxes,
  Wand2: Wand2,
  Puzzle: Puzzle,
};

function generateShareToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Expiry helper: returns label + color */
function getExpiryBadge(validUntil: string): { label: string; color: string; icon: typeof Clock } | null {
  const now = Date.now();
  const expiry = new Date(validUntil).getTime();
  const daysLeft = Math.ceil((expiry - now) / 86400000);
  if (daysLeft < 0) return { label: "Expirada", color: "bg-red-500/15 text-red-400", icon: AlertTriangle };
  if (daysLeft <= 7) return { label: `${daysLeft}d restante${daysLeft !== 1 ? "s" : ""}`, color: "bg-amber-500/15 text-amber-400", icon: Clock };
  return null;
}

/* ════════════════════════════════════════════════════════════════
   Main Page
   ════════════════════════════════════════════════════════════════ */
export function ProposalsPage() {
  const { profile } = useAuth();
  const canEdit = hasPermission(profile?.role, "proposals:edit");
  const canDelete = hasPermission(profile?.role, "proposals:delete");
  const pricing = usePricingConfig();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);

  // View modal
  const [viewProposal, setViewProposal] = useState<Proposal | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Proposal | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ProposalStatus | "">("");
  const [filterProduct, setFilterProduct] = useState<ProductKey | "">("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  useEffect(() => {
    async function fetch() {
      try {
        const [pSnap, cSnap] = await Promise.all([
          getDocs(query(collection(db, "proposals"), orderBy("createdAt", "desc"))),
          getDocs(collection(db, "clients")),
        ]);
        setProposals(pSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Proposal)));
        setClients(cSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Client)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterProduct && p.product !== filterProduct) return false;
      if (filterDateFrom && p.createdAt < filterDateFrom) return false;
      if (filterDateTo && p.createdAt > filterDateTo + "T23:59:59") return false;
      return true;
    });
  }, [proposals, search, filterStatus, filterProduct, filterDateFrom, filterDateTo]);

  const hasActiveFilters = !!(filterStatus || filterProduct || filterDateFrom || filterDateTo);

  /* ── Conversion Metrics ── */
  const metrics = useMemo(() => {
    const total = proposals.length;
    const sent = proposals.filter((p) => p.status !== "rascunho").length;
    const accepted = proposals.filter((p) => p.status === "aceite").length;
    const refused = proposals.filter((p) => p.status === "recusada").length;
    const conversionRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;
    const avgValue = accepted > 0
      ? Math.round(proposals.filter((p) => p.status === "aceite").reduce((s, p) => s + p.total, 0) / accepted)
      : 0;
    // Average response time (from createdAt to updatedAt for accepted/refused)
    const responded = proposals.filter((p) => p.status === "aceite" || p.status === "recusada");
    const avgResponseDays = responded.length > 0
      ? Math.round(
          responded.reduce((s, p) => {
            const diff = new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime();
            return s + diff / 86400000;
          }, 0) / responded.length
        )
      : 0;
    return { total, sent, accepted, refused, conversionRate, avgValue, avgResponseDays };
  }, [proposals]);

  /* ── Actions ── */
  const updateStatus = async (id: string, status: ProposalStatus) => {
    if (!canEdit) return;
    await updateDoc(doc(db, "proposals", id), { status, updatedAt: new Date().toISOString() });
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setShowWizard(true);
  };

  const handleDuplicate = async (proposal: Proposal) => {
    if (!canEdit) return;
    const now = new Date().toISOString();
    const { id, shareToken, versions, comments, ...rest } = proposal;
    const payload = {
      ...rest,
      title: `${proposal.title} (cópia)`,
      status: "rascunho" as const,
      version: 1,
      versions: [],
      comments: [],
      shareToken: undefined,
      createdAt: now,
      updatedAt: now,
    };
    const ref = await addDoc(collection(db, "proposals"), payload);
    setProposals((prev) => [{ id: ref.id, ...payload } as Proposal, ...prev]);
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "proposals", deleteTarget.id));
      setProposals((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleConvertToProject = async (proposal: Proposal) => {
    if (!canEdit) return;
    const now = new Date().toISOString();
    const project: Omit<Project, "id"> = {
      clientId: proposal.clientId,
      clientName: proposal.clientName,
      proposalId: proposal.id,
      name: proposal.title,
      description: `Projeto gerado a partir da proposta "${proposal.title}"`,
      status: "kickoff",
      assignedTo: [],
      phases: [
        { id: "1", name: "Kickoff & Planeamento", status: "pendente", tasks: [], order: 1 },
        { id: "2", name: "Configuração", status: "pendente", tasks: [], order: 2 },
        { id: "3", name: "Desenvolvimento", status: "pendente", tasks: [], order: 3 },
        { id: "4", name: "Testes & QA", status: "pendente", tasks: [], order: 4 },
        { id: "5", name: "Go-Live", status: "pendente", tasks: [], order: 5 },
      ],
      startDate: now.slice(0, 10),
      targetDate: undefined,
      completedDate: undefined,
      createdAt: now,
      updatedAt: now,
    };
    await addDoc(collection(db, "projects"), project);
    alert("Projeto criado com sucesso! Consulte a página de Projetos.");
  };

  const handleConvertToInvoice = async (proposal: Proposal) => {
    if (!canEdit) return;
    const now = new Date().toISOString();
    const invoiceCount = (await getDocs(collection(db, "invoices"))).size;
    const invoice: Omit<Invoice, "id"> = {
      clientId: proposal.clientId,
      clientName: proposal.clientName,
      projectId: undefined,
      number: `FAT-${String(invoiceCount + 1).padStart(4, "0")}`,
      items: proposal.items,
      subtotal: proposal.total,
      tax: Math.round(proposal.total * 0.23),
      total: Math.round(proposal.total * 1.23),
      status: "rascunho",
      issuedAt: now,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      paidAt: undefined,
      notes: `Fatura gerada a partir da proposta "${proposal.title}"`,
      createdBy: profile!.uid,
      createdAt: now,
      updatedAt: now,
    };
    await addDoc(collection(db, "invoices"), invoice);
    alert("Fatura criada com sucesso! Consulte a página de Faturação.");
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterProduct("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-accent-blue/50 focus:outline-none transition-colors";

  return (
    <>
      <TopBar title="Propostas" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* ── Metrics bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {(["rascunho", "enviada", "aceite", "recusada"] as ProposalStatus[]).map((s) => {
            const count = proposals.filter((p) => p.status === s).length;
            const st = STATUS_MAP[s];
            return (
              <div key={s} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", st.color)}>{st.label}</span>
                <div className="mt-2 text-2xl font-bold">{count}</div>
              </div>
            );
          })}
          {/* Conversion metrics */}
          <div className="rounded-xl border border-accent-emerald/10 bg-accent-emerald/[0.02] p-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-accent-emerald" />
              <span className="text-[10px] font-medium text-accent-emerald/70 uppercase tracking-wider">Conversão</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-accent-emerald">{metrics.conversionRate}%</div>
          </div>
          <div className="rounded-xl border border-accent-blue/10 bg-accent-blue/[0.02] p-4">
            <div className="flex items-center gap-1.5">
              <BarChart3 size={12} className="text-accent-blue" />
              <span className="text-[10px] font-medium text-accent-blue/70 uppercase tracking-wider">Valor Médio</span>
            </div>
            <div className="mt-2 text-lg font-bold text-accent-blue">{metrics.avgValue.toLocaleString("pt-PT")} €</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={12} className="text-white/40" />
              <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Resp. Média</span>
            </div>
            <div className="mt-2 text-lg font-bold">{metrics.avgResponseDays}d</div>
          </div>
        </div>

        {/* ── Search + Actions ── */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Pesquisar propostas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:border-accent-blue/50 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors",
              hasActiveFilters
                ? "border-accent-blue/40 bg-accent-blue/10 text-accent-blue"
                : "border-white/10 bg-white/5 text-white/50 hover:text-white"
            )}
          >
            <Filter size={14} />
            Filtros
            {hasActiveFilters && (
              <span className="rounded-full bg-accent-blue px-1.5 text-[10px] font-bold text-white">!</span>
            )}
          </button>
          {canEdit && (
            <button
              onClick={() => { setEditingProposal(null); setShowWizard(true); }}
              className="flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 transition-colors"
            >
              <Plus size={16} /> Nova Proposta
            </button>
          )}
        </div>

        {/* ── Advanced Filters Panel ── */}
        {showFilters && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-medium text-white/40 uppercase tracking-wider">Estado</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ProposalStatus | "")} className={inputCls}>
                <option value="">Todos</option>
                {Object.entries(STATUS_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-white/40 uppercase tracking-wider">Produto</label>
              <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value as ProductKey | "")} className={inputCls}>
                <option value="">Todos</option>
                {pricing.products.map((p) => (
                  <option key={p.key} value={p.key}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-white/40 uppercase tracking-wider">Data desde</label>
              <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-white/40 uppercase tracking-wider">Data até</label>
              <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className={inputCls} />
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="col-span-full text-xs text-accent-blue hover:underline text-left">
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-blue" />
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-ink-900/30 backdrop-blur overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Proposta</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Produto</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Validade</th>
                  {canEdit && <th className="px-4 py-3 font-medium">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const st = STATUS_MAP[p.status];
                  const productLabel = pricing.products.find((pr) => pr.key === p.product)?.title ?? p.product ?? "—";
                  const expiryBadge = p.status === "enviada" || p.status === "rascunho" ? getExpiryBadge(p.validUntil) : null;
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer" onClick={() => setViewProposal(p)}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.title}</div>
                        {p.version && p.version > 1 && (
                          <span className="text-[10px] text-white/30">v{p.version}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs hidden md:table-cell">{productLabel}</td>
                      <td className="px-4 py-3 text-white/60">{p.clientName}</td>
                      <td className="px-4 py-3 font-medium">{p.total.toLocaleString("pt-PT")} €</td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", st.color)}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 text-xs">{new Date(p.validUntil).toLocaleDateString("pt-PT")}</span>
                          {expiryBadge && (
                            <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", expiryBadge.color)}>
                              <expiryBadge.icon size={10} /> {expiryBadge.label}
                            </span>
                          )}
                        </div>
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <select
                              value={p.status}
                              onChange={(e) => updateStatus(p.id, e.target.value as ProposalStatus)}
                              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none"
                            >
                              {Object.entries(STATUS_MAP).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                            <button onClick={() => handleEdit(p)} title="Editar" className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors">
                              <Edit3 size={13} />
                            </button>
                            <button onClick={() => handleDuplicate(p)} title="Duplicar" className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors">
                              <Copy size={13} />
                            </button>
                            {canDelete && (
                              <button onClick={() => setDeleteTarget(p)} title="Eliminar" className="p-1 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="py-12 text-center text-sm text-white/30">Sem propostas.</p>
            )}
          </div>
        )}
      </div>

      {/* ── Wizard ── */}
      {showWizard && canEdit && (
        <ProposalWizard
          clients={clients}
          onClose={() => { setShowWizard(false); setEditingProposal(null); }}
          onCreated={(p) => {
            if (editingProposal) {
              setProposals((prev) => prev.map((old) => (old.id === p.id ? p : old)));
            } else {
              setProposals((prev) => [p, ...prev]);
            }
            setShowWizard(false);
            setEditingProposal(null);
          }}
          createdBy={profile!.uid}
          createdByName={profile!.name}
          pricing={pricing}
          existing={editingProposal}
        />
      )}

      {/* ── View modal ── */}
      {viewProposal && (
        <ProposalViewModal
          proposal={viewProposal}
          onClose={() => setViewProposal(null)}
          pricing={pricing}
          canEdit={canEdit}
          userName={profile?.name ?? ""}
          userId={profile?.uid ?? ""}
          onEdit={() => { setViewProposal(null); handleEdit(viewProposal); }}
          onDuplicate={() => { handleDuplicate(viewProposal); setViewProposal(null); }}
          onConvertProject={() => handleConvertToProject(viewProposal)}
          onConvertInvoice={() => handleConvertToInvoice(viewProposal)}
          onUpdate={(updated) => {
            setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setViewProposal(updated);
          }}
        />
      )}

      {/* ── Delete Confirm Dialog ── */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl border border-white/5 bg-ink-900/95 backdrop-blur-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-500/15 p-3">
                  <Trash2 size={20} className="text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold">Eliminar proposta?</h3>
                  <p className="text-xs text-white/50 mt-0.5">Esta ação é irreversível.</p>
                </div>
              </div>
              <p className="text-sm text-white/60">
                A proposta <strong className="text-white">"{deleteTarget.title}"</strong> será eliminada permanentemente.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition-colors"
                >
                  {deleting ? "A eliminar..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   WIZARD — 4-step flow (supports create + edit)
   ════════════════════════════════════════════════════════════════ */
const STEPS = [
  { num: 1, label: "Produto" },
  { num: 2, label: "Empresa" },
  { num: 3, label: "Configuração" },
  { num: 4, label: "Pré-visualização" },
];

type WizardData = {
  product: ProductKey | "";
  companyProfile: CompanyProfile;
  selectedModules: string[];
  paymentTerms: PaymentTerms;
  validUntil: string;
  notes: string;
  title: string;
  clientId: string;
  items: ProposalItem[];
  total: number;
  sprints: number;
};

const emptyProfile: CompanyProfile = {
  companyName: "", email: "", nif: "", sector: "",
  capitalSocial: "", employees: "", annualRevenue: "",
  departments: [], specificities: "", mainInterest: "",
};

function ProposalWizard({ clients, onClose, onCreated, createdBy, createdByName, pricing, existing }: {
  clients: Client[];
  onClose: () => void;
  onCreated: (p: Proposal) => void;
  createdBy: string;
  createdByName: string;
  pricing: LivePricingData;
  existing: Proposal | null;
}) {
  const isEdit = !!existing;
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<WizardData>(() => {
    if (existing) {
      return {
        product: existing.product,
        companyProfile: { ...existing.companyProfile },
        selectedModules: [...(existing.modules ?? [])],
        paymentTerms: existing.paymentTerms,
        validUntil: existing.validUntil,
        notes: existing.notes ?? "",
        title: existing.title,
        clientId: existing.clientId,
        items: [...existing.items],
        total: existing.total,
        sprints: existing.estimatedSprints ?? 0,
      };
    }
    return {
      product: "",
      companyProfile: { ...emptyProfile },
      selectedModules: [],
      paymentTerms: "50_50",
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      notes: "",
      title: "",
      clientId: "",
      items: [],
      total: 0,
      sprints: 0,
    };
  });

  useEffect(() => {
    if (!data.product || step < 3) return;
    const result = pricing.calculatePrice(
      data.product as ProductKey,
      data.selectedModules,
      data.companyProfile.employees,
      data.companyProfile.annualRevenue,
      data.paymentTerms
    );
    setData((prev) => ({ ...prev, items: result.items, total: result.total, sprints: result.sprints }));
  }, [data.product, data.selectedModules, data.companyProfile.employees, data.companyProfile.annualRevenue, data.paymentTerms, step]);

  const canNext = (): boolean => {
    if (step === 1) return !!data.product;
    if (step === 2) {
      const p = data.companyProfile;
      return !!(p.companyName && p.email && p.nif && p.sector && p.employees && p.annualRevenue && p.mainInterest);
    }
    if (step === 3) return data.product === "diagnostico" || data.selectedModules.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const productInfo = pricing.products.find((p) => p.key === data.product)!;

      if (isEdit) {
        // Save a version snapshot before editing
        const versionSnapshot: ProposalVersion = {
          version: existing!.version ?? 1,
          title: existing!.title,
          product: existing!.product,
          modules: [...existing!.modules],
          items: [...existing!.items],
          total: existing!.total,
          paymentTerms: existing!.paymentTerms,
          validUntil: existing!.validUntil,
          notes: existing!.notes,
          savedBy: createdByName,
          savedAt: now,
        };
        const prevVersions = existing!.versions ?? [];
        const newVersion = (existing!.version ?? 1) + 1;

        const updates = {
          clientId: data.clientId || existing!.clientId,
          clientName: data.companyProfile.companyName,
          title: data.title || `${productInfo.title} — ${data.companyProfile.companyName}`,
          product: data.product as ProductKey,
          companyProfile: data.companyProfile,
          modules: data.selectedModules,
          estimatedSprints: data.sprints,
          paymentTerms: data.paymentTerms,
          items: data.items,
          total: data.total,
          validUntil: data.validUntil,
          notes: data.notes || undefined,
          version: newVersion,
          versions: [...prevVersions, versionSnapshot],
          updatedAt: now,
        };
        await updateDoc(doc(db, "proposals", existing!.id), updates);
        onCreated({ ...existing!, ...updates } as Proposal);
      } else {
        const payload = {
          clientId: data.clientId || "",
          clientName: data.companyProfile.companyName,
          title: data.title || `${productInfo.title} — ${data.companyProfile.companyName}`,
          product: data.product as ProductKey,
          companyProfile: data.companyProfile,
          modules: data.selectedModules,
          estimatedSprints: data.sprints,
          paymentTerms: data.paymentTerms,
          items: data.items,
          total: data.total,
          status: "rascunho" as const,
          validUntil: data.validUntil,
          notes: data.notes || undefined,
          version: 1,
          versions: [],
          comments: [],
          createdBy,
          createdAt: now,
          updatedAt: now,
        };
        const ref = await addDoc(collection(db, "proposals"), payload);
        onCreated({ id: ref.id, ...payload } as Proposal);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl rounded-2xl border border-white/5 bg-ink-900/95 backdrop-blur-xl max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="text-lg font-bold">{isEdit ? "Editar Proposta" : "Nova Proposta"}</h2>
            <button type="button" onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
          </div>

          {/* Stepper */}
          <div className="px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s.num} className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-colors shrink-0",
                    step > s.num ? "bg-accent-emerald text-white" :
                    step === s.num ? "bg-accent-blue text-white" :
                    "bg-white/5 text-white/30"
                  )}>
                    {step > s.num ? <CheckCircle2 size={16} /> : s.num}
                  </div>
                  <span className={cn("text-xs font-medium hidden sm:block", step >= s.num ? "text-white" : "text-white/30")}>{s.label}</span>
                  {i < STEPS.length - 1 && <div className={cn("flex-1 h-px", step > s.num ? "bg-accent-emerald/40" : "bg-white/5")} />}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {step === 1 && <Step1Product data={data} setData={setData} pricing={pricing} />}
            {step === 2 && <Step2Company data={data} setData={setData} clients={clients} />}
            {step === 3 && <Step3Pricing data={data} setData={setData} pricing={pricing} />}
            {step === 4 && <Step4Preview data={data} setData={setData} pricing={pricing} />}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => step === 1 ? onClose() : setStep(step - 1)}
              className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} /> {step === 1 ? "Cancelar" : "Anterior"}
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className="flex items-center gap-1 rounded-xl bg-accent-blue px-5 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Seguinte <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-1 rounded-xl bg-accent-emerald px-5 py-2 text-sm font-medium text-white hover:bg-accent-emerald/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "A guardar..." : isEdit ? "Guardar Alterações" : "Criar Proposta"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   Step 1 — Product Selection
   ════════════════════════════════════════════════════════════════ */
function Step1Product({ data, setData, pricing }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>>; pricing: LivePricingData }) {
  return (
    <div>
      <p className="text-sm text-white/50 mb-5">Selecione o produto ou serviço para esta proposta.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {pricing.products.map((p) => {
          const Icon = PRODUCT_ICONS[p.icon] ?? Boxes;
          const selected = data.product === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setData((prev) => ({ ...prev, product: p.key, selectedModules: [] }))}
              className={cn(
                "relative text-left rounded-2xl border p-5 transition-all duration-200",
                selected
                  ? "border-accent-blue/50 bg-accent-blue/10 ring-1 ring-accent-blue/30"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]",
                p.highlight && !selected && "border-indigo-400/15 bg-indigo-500/[0.03]"
              )}
            >
              {p.highlight && (
                <div className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  Mais pedido
                </div>
              )}
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("rounded-xl p-2.5", selected ? "bg-accent-blue/20" : "bg-white/[0.04]")}>
                  <Icon size={18} className={selected ? "text-accent-blue" : "text-white/60"} />
                </div>
                <div>
                  <div className="text-sm font-semibold">{p.title}</div>
                  <div className="text-xs text-white/40">{p.basePrice === 0 ? "Gratuito" : `A partir de ${p.basePrice.toLocaleString("pt-PT")} €`}</div>
                </div>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{p.description}</p>
              {selected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 size={18} className="text-accent-blue" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Step 2 — Company Profile
   ════════════════════════════════════════════════════════════════ */
function Step2Company({ data, setData, clients }: {
  data: WizardData;
  setData: React.Dispatch<React.SetStateAction<WizardData>>;
  clients: Client[];
}) {
  const p = data.companyProfile;

  const updateProfile = (updates: Partial<CompanyProfile>) => {
    setData((prev) => ({ ...prev, companyProfile: { ...prev.companyProfile, ...updates } }));
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    const primary = client.contacts.find((c) => c.primary) ?? client.contacts[0];
    setData((prev) => ({
      ...prev,
      clientId,
      companyProfile: {
        ...prev.companyProfile,
        companyName: client.company,
        email: primary?.email ?? "",
        nif: client.nif ?? "",
        sector: client.industry ?? "",
      },
    }));
  };

  const toggleDept = (dept: string) => {
    updateProfile({
      departments: p.departments.includes(dept)
        ? p.departments.filter((d) => d !== dept)
        : [...p.departments, dept],
    });
  };

  const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-accent-blue/50 focus:outline-none transition-colors";
  const labelCls = "mb-1.5 block text-xs font-medium text-white/50";

  return (
    <div className="space-y-5">
      <p className="text-sm text-white/50">Preencha os dados da empresa para personalizar a proposta.</p>

      {clients.length > 0 && (
        <div>
          <label className={labelCls}>Importar dados de cliente existente</label>
          <select value={data.clientId} onChange={(e) => handleClientSelect(e.target.value)} className={inputCls}>
            <option value="">— Novo cliente —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Nome da empresa *</label>
          <input required value={p.companyName} onChange={(e) => updateProfile({ companyName: e.target.value })} className={inputCls} placeholder="NextOps, Lda." />
        </div>
        <div>
          <label className={labelCls}>Email para proposta *</label>
          <input type="email" required value={p.email} onChange={(e) => updateProfile({ email: e.target.value })} className={inputCls} placeholder="email@empresa.pt" />
        </div>
        <div>
          <label className={labelCls}>NIF *</label>
          <input required value={p.nif} onChange={(e) => updateProfile({ nif: e.target.value })} className={inputCls} placeholder="123456789" />
        </div>
        <div>
          <label className={labelCls}>Setor de atividade *</label>
          <select required value={p.sector} onChange={(e) => updateProfile({ sector: e.target.value })} className={inputCls}>
            <option value="">Selecionar...</option>
            {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Capital social</label>
          <input value={p.capitalSocial} onChange={(e) => updateProfile({ capitalSocial: e.target.value })} className={inputCls} placeholder="Ex: 50 000 €" />
        </div>
        <div>
          <label className={labelCls}>Nº de funcionários *</label>
          <select required value={p.employees} onChange={(e) => updateProfile({ employees: e.target.value })} className={inputCls}>
            <option value="">Selecionar...</option>
            {EMPLOYEE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Volume de negócio anual *</label>
          <select required value={p.annualRevenue} onChange={(e) => updateProfile({ annualRevenue: e.target.value })} className={inputCls}>
            <option value="">Selecionar...</option>
            {REVENUE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Interesse principal *</label>
          <select required value={p.mainInterest} onChange={(e) => updateProfile({ mainInterest: e.target.value })} className={inputCls}>
            <option value="">Selecionar...</option>
            {INTERESTS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Departamentos com necessidade de controlo</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {DEPARTMENTS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => toggleDept(d.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors",
                p.departments.includes(d.value)
                  ? "border-accent-blue/40 bg-accent-blue/15 text-accent-blue"
                  : "border-white/10 bg-white/5 text-white/40 hover:text-white/60"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Especificidades / Desafios</label>
        <textarea
          rows={3}
          value={p.specificities}
          onChange={(e) => updateProfile({ specificities: e.target.value })}
          className={cn(inputCls, "resize-none")}
          placeholder="Descreva os principais desafios operacionais, processos manuais, dificuldades de controlo..."
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Step 3 — Pricing Configurator
   ════════════════════════════════════════════════════════════════ */
function Step3Pricing({ data, setData, pricing }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>>; pricing: LivePricingData }) {
  useEffect(() => {
    if (data.selectedModules.length === 0 && data.product && data.product !== "diagnostico") {
      const recommended = pricing.getRecommendedModules(data.product as ProductKey, data.companyProfile);
      setData((prev) => ({ ...prev, selectedModules: recommended }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDiag = data.product === "diagnostico";

  const toggleModule = (key: string) => {
    setData((prev) => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(key)
        ? prev.selectedModules.filter((k) => k !== key)
        : [...prev.selectedModules, key],
    }));
  };

  const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-accent-blue/50 focus:outline-none transition-colors";
  const labelCls = "mb-1.5 block text-xs font-medium text-white/50";

  return (
    <div className="space-y-6">
      {isDiag ? (
        <div className="rounded-xl border border-accent-emerald/20 bg-accent-emerald/5 p-4">
          <p className="text-sm text-accent-emerald font-medium">Diagnóstico Operacional — Gratuito</p>
          <p className="text-xs text-white/50 mt-1">
            O diagnóstico é sem custo. Inclui mapeamento de processos, identificação de gargalos e proposta de automações.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-white/50 mb-3">
            Módulos recomendados para o setor <strong className="text-white">{SECTORS.find((s) => s.value === data.companyProfile.sector)?.label}</strong>.
            Ajuste conforme necessário.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {pricing.modules.filter((m) => {
              if (data.product === "erp_core" && m.key.startsWith("ia_")) return false;
              return true;
            }).map((m) => {
              const selected = data.selectedModules.includes(m.key);
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => toggleModule(m.key)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                    selected
                      ? "border-accent-blue/40 bg-accent-blue/10"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center h-5 w-5 rounded border transition-colors shrink-0",
                    selected ? "border-accent-blue bg-accent-blue" : "border-white/20 bg-white/5"
                  )}>
                    {selected && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{m.title}</div>
                    <div className="text-[10px] text-white/30">{m.price.toLocaleString("pt-PT")} € base • {m.sprints} sprint</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Condições de pagamento</label>
          <select
            value={data.paymentTerms}
            onChange={(e) => setData((prev) => ({ ...prev, paymentTerms: e.target.value as PaymentTerms }))}
            className={inputCls}
          >
            {pricing.paymentOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}{o.discount > 0 ? ` (${Math.round(o.discount * 100)}% desc.)` : o.discount < 0 ? ` (+${Math.round(Math.abs(o.discount) * 100)}%)` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Válida até</label>
          <input
            type="date"
            value={data.validUntil}
            onChange={(e) => setData((prev) => ({ ...prev, validUntil: e.target.value }))}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Título da proposta (opcional — gerado automaticamente)</label>
        <input
          value={data.title}
          onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
          className={inputCls}
          placeholder={`${pricing.products.find((p) => p.key === data.product)?.title ?? ""} — ${data.companyProfile.companyName}`}
        />
      </div>

      <div>
        <label className={labelCls}>Notas internas</label>
        <textarea
          rows={2}
          value={data.notes}
          onChange={(e) => setData((prev) => ({ ...prev, notes: e.target.value }))}
          className={cn(inputCls, "resize-none")}
          placeholder="Notas visíveis apenas internamente..."
        />
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
        <div className="text-xs font-medium text-white/40 uppercase tracking-wider">Resumo</div>
        {data.items.map((it, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-white/60">{it.description}</span>
            <span className="font-medium">{it.total.toLocaleString("pt-PT")} €</span>
          </div>
        ))}
        <div className="border-t border-white/5 pt-2 flex justify-between">
          <span className="text-sm font-bold">Total</span>
          <span className="text-lg font-bold text-accent-blue">{data.total.toLocaleString("pt-PT")} €</span>
        </div>
        <div className="text-[10px] text-white/30">
          Estimativa: {data.sprints} sprint(s) • Valores sem IVA
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Step 4 — Preview & PDF
   ════════════════════════════════════════════════════════════════ */
function Step4Preview({ data, setData: _setData, pricing }: { data: WizardData; setData: React.Dispatch<React.SetStateAction<WizardData>>; pricing: LivePricingData }) {
  const [generating, setGenerating] = useState(false);
  const product = data.product as ProductKey;
  const productInfo = pricing.products.find((p) => p.key === product)!;
  const paymentLabel = pricing.paymentOptions.find((o) => o.value === data.paymentTerms)?.label ?? "";
  const proposalTitle = data.title || `${productInfo.title} — ${data.companyProfile.companyName}`;

  const docData = buildProposalDocument({
    product, profile: data.companyProfile, modules: data.selectedModules,
    items: data.items, total: data.total, sprints: data.sprints,
    validUntil: data.validUntil, paymentTermsLabel: paymentLabel, notes: data.notes,
  });

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const blob = await generateProposalPDF({
        product, profile: data.companyProfile, modules: data.selectedModules,
        items: data.items, total: data.total, sprints: data.sprints,
        validUntil: data.validUntil, paymentTermsLabel: paymentLabel, notes: data.notes,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Proposta_${data.companyProfile.companyName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">Pré-visualização da proposta. Reveja antes de criar.</p>
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={generating}
          className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50 transition-colors"
        >
          <Download size={14} /> {generating ? "A gerar..." : "Descarregar PDF"}
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
        <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">NextOps — Proposta Comercial</div>
              <h3 className="text-lg font-bold">{proposalTitle}</h3>
            </div>
            <div className="text-right text-xs text-white/40">
              <div>NIF: {data.companyProfile.nif}</div>
              <div>{new Date().toLocaleDateString("pt-PT")}</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 text-sm">
          <div className="whitespace-pre-line text-white/60 text-xs leading-relaxed">{docData.intro}</div>

          <div>
            <div className="text-xs font-bold text-accent-blue uppercase tracking-wider mb-2">Contexto & Diagnóstico</div>
            <div className="whitespace-pre-line text-white/50 text-xs leading-relaxed">
              {docData.context.replace("CONTEXTO & DIAGNÓSTICO\n\n", "")}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-accent-blue uppercase tracking-wider mb-2">Solução Proposta</div>
            <div className="whitespace-pre-line text-white/50 text-xs leading-relaxed">
              {docData.solution.replace("SOLUÇÃO PROPOSTA\n\n", "")}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-accent-blue uppercase tracking-wider mb-2">Investimento</div>
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/[0.03] text-white/40">
                    <th className="px-3 py-2 text-left font-medium">Descrição</th>
                    <th className="px-3 py-2 text-center font-medium w-12">Qtd</th>
                    <th className="px-3 py-2 text-right font-medium w-24">Preço Unit.</th>
                    <th className="px-3 py-2 text-right font-medium w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((it, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="px-3 py-2 text-white/60">{it.description}</td>
                      <td className="px-3 py-2 text-center text-white/40">{it.quantity}</td>
                      <td className="px-3 py-2 text-right text-white/40">{it.unitPrice.toLocaleString("pt-PT")} €</td>
                      <td className="px-3 py-2 text-right font-medium">{it.total.toLocaleString("pt-PT")} €</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 bg-accent-blue/5">
                    <td colSpan={3} className="px-3 py-2 text-right font-bold">TOTAL</td>
                    <td className="px-3 py-2 text-right text-base font-bold text-accent-blue">{data.total.toLocaleString("pt-PT")} €</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="text-[10px] text-white/30 mt-1">Condições: {paymentLabel} • Valores sem IVA</div>
          </div>

          <div>
            <div className="text-xs font-bold text-accent-blue uppercase tracking-wider mb-2">Condições Gerais</div>
            <div className="whitespace-pre-line text-white/50 text-xs leading-relaxed">
              {docData.conditions.replace("CONDIÇÕES GERAIS\n\n", "")}
            </div>
          </div>

          <div className="whitespace-pre-line text-white/50 text-xs leading-relaxed border-t border-white/5 pt-4">
            {docData.closing}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Proposal View Modal (with comments, versions, share, actions)
   ════════════════════════════════════════════════════════════════ */
function ProposalViewModal({ proposal, onClose, pricing, canEdit, userName, userId, onEdit, onDuplicate, onConvertProject, onConvertInvoice, onUpdate }: {
  proposal: Proposal;
  onClose: () => void;
  pricing: LivePricingData;
  canEdit: boolean;
  userName: string;
  userId: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onConvertProject: () => void;
  onConvertInvoice: () => void;
  onUpdate: (p: Proposal) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "comments" | "versions">("details");
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showShareCopied, setShowShareCopied] = useState(false);

  const st = STATUS_MAP[proposal.status];
  const paymentLabel = pricing.paymentOptions.find((o) => o.value === proposal.paymentTerms)?.label ?? "50% / 50%";
  const canGeneratePDF = !!proposal.companyProfile && !!proposal.product;

  const handleDownloadPDF = async () => {
    if (!canGeneratePDF) return;
    setGenerating(true);
    try {
      const blob = await generateProposalPDF({
        product: proposal.product,
        profile: proposal.companyProfile,
        modules: proposal.modules ?? [],
        items: proposal.items,
        total: proposal.total,
        sprints: proposal.estimatedSprints ?? 1,
        validUntil: proposal.validUntil,
        paymentTermsLabel: paymentLabel,
        notes: proposal.notes,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Proposta_${proposal.clientName.replace(/\s+/g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  /* ── Comments ── */
  const handleAddComment = async () => {
    if (!newComment.trim() || addingComment) return;
    setAddingComment(true);
    try {
      const comment: ProposalComment = {
        id: crypto.randomUUID(),
        authorId: userId,
        authorName: userName,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      };
      const updatedComments = [...(proposal.comments ?? []), comment];
      await updateDoc(doc(db, "proposals", proposal.id), {
        comments: updatedComments,
        updatedAt: new Date().toISOString(),
      });
      onUpdate({ ...proposal, comments: updatedComments });
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setAddingComment(false);
    }
  };

  /* ── Shareable Link ── */
  const handleGenerateShareLink = async () => {
    try {
      let token = proposal.shareToken;
      if (!token) {
        token = generateShareToken();
        await updateDoc(doc(db, "proposals", proposal.id), { shareToken: token });
        onUpdate({ ...proposal, shareToken: token });
      }
      const url = `${window.location.origin}/proposta/${token}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      setShowShareCopied(true);
      setTimeout(() => setShowShareCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { key: "details" as const, label: "Detalhes", icon: Receipt },
    { key: "comments" as const, label: `Comentários (${proposal.comments?.length ?? 0})`, icon: MessageSquare },
    { key: "versions" as const, label: `Versões (${proposal.versions?.length ?? 0})`, icon: History },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-2xl border border-white/5 bg-ink-900/95 backdrop-blur-xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate">{proposal.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", st.color)}>{st.label}</span>
                <span className="text-xs text-white/30">{proposal.clientName}</span>
                {proposal.version && proposal.version > 1 && (
                  <span className="text-[10px] text-white/20">v{proposal.version}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {canEdit && (
                <>
                  <button onClick={onEdit} title="Editar" className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={onDuplicate} title="Duplicar" className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <Copy size={14} />
                  </button>
                  {proposal.status === "aceite" && (
                    <>
                      <button onClick={onConvertProject} title="Converter em Projeto" className="p-2 rounded-lg hover:bg-accent-emerald/20 text-white/40 hover:text-accent-emerald transition-colors">
                        <FolderKanban size={14} />
                      </button>
                      <button onClick={onConvertInvoice} title="Converter em Fatura" className="p-2 rounded-lg hover:bg-accent-blue/20 text-white/40 hover:text-accent-blue transition-colors">
                        <Receipt size={14} />
                      </button>
                    </>
                  )}
                  <button onClick={handleGenerateShareLink} title="Link partilhável" className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors relative">
                    <Link2 size={14} />
                    {showShareCopied && (
                      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-accent-emerald px-2 py-0.5 text-[10px] font-medium text-white">
                        Copiado!
                      </span>
                    )}
                  </button>
                </>
              )}
              {canGeneratePDF && (
                <button
                  onClick={handleDownloadPDF}
                  disabled={generating}
                  className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50"
                >
                  <Download size={12} /> {generating ? "..." : "PDF"}
                </button>
              )}
              <button type="button" onClick={onClose} className="p-2 text-white/40 hover:text-white"><X size={20} /></button>
            </div>
          </div>

          {/* Share URL banner */}
          {shareUrl && (
            <div className="px-6 py-2 bg-accent-blue/5 border-b border-accent-blue/10 flex items-center gap-2 text-xs">
              <Link2 size={12} className="text-accent-blue shrink-0" />
              <input
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-accent-blue/80 font-mono text-[11px] outline-none"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={() => { navigator.clipboard.writeText(shareUrl); setShowShareCopied(true); setTimeout(() => setShowShareCopied(false), 2500); }}
                className="text-accent-blue hover:text-white text-[10px] font-medium"
              >
                Copiar
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-white/5 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors -mb-px",
                  activeTab === tab.key
                    ? "border-accent-blue text-accent-blue"
                    : "border-transparent text-white/40 hover:text-white/60"
                )}
              >
                <tab.icon size={13} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "details" && (
              <div className="space-y-4 text-sm">
                {/* Company info */}
                {proposal.companyProfile && (
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      ["Empresa", proposal.companyProfile.companyName],
                      ["NIF", proposal.companyProfile.nif],
                      ["Email", proposal.companyProfile.email],
                      ["Setor", SECTORS.find((s) => s.value === proposal.companyProfile.sector)?.label ?? "—"],
                      ["Funcionários", proposal.companyProfile.employees],
                      ["Volume Negócio", REVENUE_RANGES.find((r) => r.value === proposal.companyProfile.annualRevenue)?.label ?? "—"],
                    ] as [string, string][]).map(([label, value]) => (
                      <div key={label}>
                        <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
                        <div className="text-xs text-white/70">{value || "—"}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Items */}
                <div className="rounded-xl border border-white/5 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-white/[0.03] text-white/40">
                        <th className="px-3 py-2 text-left font-medium">Descrição</th>
                        <th className="px-3 py-2 text-right font-medium w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposal.items.map((it, i) => (
                        <tr key={i} className="border-t border-white/5">
                          <td className="px-3 py-2 text-white/60">{it.description}</td>
                          <td className="px-3 py-2 text-right font-medium">{it.total.toLocaleString("pt-PT")} €</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-white/10">
                        <td className="px-3 py-2 text-right font-bold">TOTAL</td>
                        <td className="px-3 py-2 text-right text-base font-bold text-accent-blue">{proposal.total.toLocaleString("pt-PT")} €</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span>Válida até: {new Date(proposal.validUntil).toLocaleDateString("pt-PT")}</span>
                  {proposal.estimatedSprints && <span>Sprints: {proposal.estimatedSprints}</span>}
                  <span>Pagamento: {paymentLabel}</span>
                </div>

                {proposal.notes && (
                  <div className="text-xs text-white/40 bg-white/[0.02] rounded-lg p-3">{proposal.notes}</div>
                )}
              </div>
            )}

            {activeTab === "comments" && (
              <div className="space-y-4">
                {/* Comment input */}
                {canEdit && (
                  <div className="flex gap-2">
                    <input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                      placeholder="Adicionar comentário..."
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-accent-blue/50 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || addingComment}
                      className="rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 disabled:opacity-30 transition-colors"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                )}

                {/* Comments timeline */}
                {(proposal.comments && proposal.comments.length > 0) ? (
                  <div className="space-y-3">
                    {[...proposal.comments].reverse().map((c) => (
                      <div key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-accent-blue/15 flex items-center justify-center text-[10px] font-bold text-accent-blue">
                              {c.authorName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium">{c.authorName}</span>
                          </div>
                          <span className="text-[10px] text-white/30">
                            {new Date(c.createdAt).toLocaleDateString("pt-PT")} {new Date(c.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">{c.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-white/20">Sem comentários.</p>
                )}
              </div>
            )}

            {activeTab === "versions" && (
              <div className="space-y-3">
                {/* Current version */}
                <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-accent-blue px-2 py-0.5 text-[10px] font-bold text-white">v{proposal.version ?? 1}</span>
                      <span className="text-xs font-medium">Versão atual</span>
                    </div>
                    <span className="text-[10px] text-white/30">{new Date(proposal.updatedAt).toLocaleDateString("pt-PT")}</span>
                  </div>
                  <div className="mt-1.5 text-xs text-white/50">
                    Total: {proposal.total.toLocaleString("pt-PT")} € • {proposal.items.length} item(s)
                  </div>
                </div>

                {/* Previous versions */}
                {proposal.versions && proposal.versions.length > 0 ? (
                  [...proposal.versions].reverse().map((v) => (
                    <div key={v.version} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/50">v{v.version}</span>
                          <span className="text-xs text-white/40">{v.title}</span>
                        </div>
                        <span className="text-[10px] text-white/30">
                          {new Date(v.savedAt).toLocaleDateString("pt-PT")} • {v.savedBy}
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs text-white/40">
                        Total: {v.total.toLocaleString("pt-PT")} € • {v.items.length} item(s) • Módulos: {v.modules.length}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-white/20">Sem versões anteriores.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
