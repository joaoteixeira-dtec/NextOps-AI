import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { hasPermission } from "../../lib/permissions";
import { TopBar } from "../components/TopBar";
import type { Client, ClientContact } from "../../lib/types";
import { cn } from "../../lib/cn";
import { Plus, Search, Building2, Mail, Phone, User, X, Edit2 } from "lucide-react";

export function ClientsPage() {
  const { profile } = useAuth();
  const canEdit = hasPermission(profile?.role, "clients:edit");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const fetchClients = async () => {
    try {
      const snap = await getDocs(query(collection(db, "clients"), orderBy("createdAt", "desc")));
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Client)));
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const filtered = clients.filter(
    (c) =>
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.contacts.some((ct) => ct.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <TopBar title="Clientes" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Pesquisar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:border-accent-blue/50 focus:outline-none"
            />
          </div>
          {canEdit && (
            <button
              onClick={() => { setEditClient(null); setShowForm(true); }}
              className="flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 transition-colors"
            >
              <Plus size={16} />
              Novo Cliente
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-blue" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((client) => {
              const primary = client.contacts.find((c) => c.primary) ?? client.contacts[0];
              return (
                <div
                  key={client.id}
                  className="rounded-2xl border border-white/5 bg-ink-900/40 p-5 backdrop-blur hover:border-white/10 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-accent-blue/10 p-2.5 text-accent-blue">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{client.company}</h3>
                        {client.industry && (
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">{client.industry}</p>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => { setEditClient(client); setShowForm(true); }}
                        className="rounded-lg p-1 text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>

                  {primary && (
                    <div className="space-y-1.5 text-xs text-white/50">
                      <div className="flex items-center gap-2">
                        <User size={12} />
                        <span>{primary.name}</span>
                        {primary.role && <span className="text-white/25">· {primary.role}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={12} />
                        <a href={`mailto:${primary.email}`} className="hover:text-accent-blue">{primary.email}</a>
                      </div>
                      {primary.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={12} />
                          <span>{primary.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {client.nif && (
                    <p className="mt-3 text-[10px] text-white/20">NIF: {client.nif}</p>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-full py-12 text-center text-sm text-white/30">
                {search ? "Nenhum cliente encontrado." : "Sem clientes registados."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Client Form Modal ── */}
      {showForm && canEdit && (
        <ClientFormModal
          client={editClient}
          onClose={() => { setShowForm(false); setEditClient(null); }}
          onSaved={(c) => {
            if (editClient) {
              setClients((prev) => prev.map((x) => (x.id === c.id ? c : x)));
            } else {
              setClients((prev) => [c, ...prev]);
            }
            setShowForm(false);
            setEditClient(null);
          }}
        />
      )}
    </>
  );
}

/* ═══════════════ Client Form Modal ═══════════════ */

function ClientFormModal({
  client,
  onClose,
  onSaved,
}: {
  client: Client | null;
  onClose: () => void;
  onSaved: (c: Client) => void;
}) {
  const [form, setForm] = useState({
    company: client?.company ?? "",
    nif: client?.nif ?? "",
    address: client?.address ?? "",
    industry: client?.industry ?? "",
    notes: client?.notes ?? "",
    contactName: client?.contacts[0]?.name ?? "",
    contactEmail: client?.contacts[0]?.email ?? "",
    contactPhone: client?.contacts[0]?.phone ?? "",
    contactRole: client?.contacts[0]?.role ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const contacts: ClientContact[] = [
        {
          name: form.contactName,
          email: form.contactEmail,
          phone: form.contactPhone || undefined,
          role: form.contactRole || undefined,
          primary: true,
        },
      ];
      const data = {
        company: form.company,
        nif: form.nif || undefined,
        address: form.address || undefined,
        industry: form.industry || undefined,
        notes: form.notes || undefined,
        contacts,
        updatedAt: now,
        ...(client ? {} : { createdAt: now }),
      };

      if (client) {
        await updateDoc(doc(db, "clients", client.id), data);
        onSaved({ ...client, ...data } as Client);
      } else {
        const ref = await addDoc(collection(db, "clients"), { ...data, createdAt: now });
        onSaved({ id: ref.id, ...data, createdAt: now } as Client);
      }
    } catch (err) {
      console.error("Error saving client:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg rounded-2xl border border-white/5 bg-ink-900/95 backdrop-blur-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">{client ? "Editar Cliente" : "Novo Cliente"}</h2>
            <button type="button" onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-white/50">Empresa *</label>
              <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">NIF</label>
              <input value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Setor</label>
              <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none" />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-white/50">Morada</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none" />
            </div>
          </div>

          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider pt-2">Contacto Principal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-white/50">Nome *</label>
              <input required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Email *</label>
              <input type="email" required value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Telefone</label>
              <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Cargo</label>
              <input value={form.contactRole} onChange={(e) => setForm({ ...form, contactRole: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/50">Notas</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50">
              {saving ? "A guardar..." : client ? "Guardar" : "Criar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
