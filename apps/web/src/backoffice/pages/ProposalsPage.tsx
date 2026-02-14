import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { hasPermission } from "../../lib/permissions";
import { TopBar } from "../components/TopBar";
import type { Proposal, ProposalItem, ProposalStatus, Client } from "../../lib/types";
import { cn } from "../../lib/cn";
import { Plus, Search, FileText, X, Trash2 } from "lucide-react";

const STATUS_MAP: Record<ProposalStatus, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-white/10 text-white/50" },
  enviada: { label: "Enviada", color: "bg-accent-blue/15 text-accent-blue" },
  aceite: { label: "Aceite", color: "bg-accent-emerald/15 text-accent-emerald" },
  recusada: { label: "Recusada", color: "bg-red-500/15 text-red-400" },
};

export function ProposalsPage() {
  const { profile } = useAuth();
  const canEdit = hasPermission(profile?.role, "proposals:edit");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

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

  const filtered = proposals.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id: string, status: ProposalStatus) => {
    if (!canEdit) return;
    await updateDoc(doc(db, "proposals", id), { status, updatedAt: new Date().toISOString() });
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  return (
    <>
      <TopBar title="Propostas" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Pesquisar propostas..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:border-accent-blue/50 focus:outline-none" />
          </div>
          {canEdit && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90">
              <Plus size={16} /> Nova Proposta
            </button>
          )}
        </div>

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
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Válida até</th>
                  {canEdit && <th className="px-4 py-3 font-medium">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const st = STATUS_MAP[p.status];
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium">{p.title}</td>
                      <td className="px-4 py-3 text-white/60">{p.clientName}</td>
                      <td className="px-4 py-3 font-medium">{p.total.toLocaleString("pt-PT")} €</td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", st.color)}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">{new Date(p.validUntil).toLocaleDateString("pt-PT")}</td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          <select
                            value={p.status}
                            onChange={(e) => updateStatus(p.id, e.target.value as ProposalStatus)}
                            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none"
                          >
                            {Object.entries(STATUS_MAP).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
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

      {showForm && canEdit && (
        <ProposalFormModal
          clients={clients}
          onClose={() => setShowForm(false)}
          onCreated={(p) => { setProposals((prev) => [p, ...prev]); setShowForm(false); }}
          createdBy={profile!.uid}
        />
      )}
    </>
  );
}

/* ═══════════════ Proposal Form ═══════════════ */
function ProposalFormModal({ clients, onClose, onCreated, createdBy }: {
  clients: Client[];
  onClose: () => void;
  onCreated: (p: Proposal) => void;
  createdBy: string;
}) {
  const [form, setForm] = useState({ clientId: "", title: "", validUntil: "", notes: "" });
  const [items, setItems] = useState<ProposalItem[]>([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const [saving, setSaving] = useState(false);

  const updateItem = (i: number, field: keyof ProposalItem, val: string | number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: val };
      copy[i].total = copy[i].quantity * copy[i].unitPrice;
      return copy;
    });
  };

  const total = items.reduce((s, it) => s + it.total, 0);
  const clientName = clients.find((c) => c.id === form.clientId)?.company ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const data = {
        clientId: form.clientId,
        clientName,
        title: form.title,
        items,
        total,
        status: "rascunho" as const,
        validUntil: form.validUntil,
        notes: form.notes || undefined,
        createdBy,
        createdAt: now,
        updatedAt: now,
      };
      const ref = await addDoc(collection(db, "proposals"), data);
      onCreated({ id: ref.id, ...data } as Proposal);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-2xl border border-white/5 bg-ink-900/95 backdrop-blur-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Nova Proposta</h2><button type="button" onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button></div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-white/50">Título *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Cliente *</label>
              <select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none">
                <option value="">Selecionar...</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Válida até *</label>
              <input type="date" required value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none" />
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="mb-2 block text-xs font-medium text-white/40 uppercase tracking-wider">Itens</label>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2 items-end">
                <div className="flex-1"><input placeholder="Descrição" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" /></div>
                <div className="w-20"><input type="number" min={1} placeholder="Qtd" value={item.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" /></div>
                <div className="w-28"><input type="number" min={0} step={0.01} placeholder="€ unit." value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" /></div>
                <div className="w-24 text-right text-sm font-medium py-2">{item.total.toLocaleString("pt-PT")} €</div>
                {items.length > 1 && <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-400/50 hover:text-red-400 p-2"><Trash2 size={14} /></button>}
              </div>
            ))}
            <button type="button" onClick={() => setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }])} className="text-xs text-accent-blue hover:underline mt-1">+ Adicionar item</button>
            <div className="mt-3 text-right text-lg font-bold">{total.toLocaleString("pt-PT")} €</div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/50">Notas</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50">{saving ? "A guardar..." : "Criar Proposta"}</button>
          </div>
        </form>
      </div>
    </>
  );
}
