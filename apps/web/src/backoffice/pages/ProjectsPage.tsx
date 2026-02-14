import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { hasPermission } from "../../lib/permissions";
import { TopBar } from "../components/TopBar";
import type { Project, ProjectStatus, Client } from "../../lib/types";
import { cn } from "../../lib/cn";
import { Plus, Search, FolderKanban, X } from "lucide-react";

const STATUS_MAP: Record<ProjectStatus, { label: string; color: string; order: number }> = {
  kickoff:          { label: "Kickoff",          color: "bg-white/10 text-white/60",                order: 0 },
  configuracao:     { label: "Configuração",     color: "bg-accent-cyan/15 text-accent-cyan",       order: 1 },
  desenvolvimento:  { label: "Desenvolvimento",  color: "bg-accent-blue/15 text-accent-blue",       order: 2 },
  testes:           { label: "Testes",            color: "bg-accent-violet/15 text-accent-violet",   order: 3 },
  "go-live":        { label: "Go-Live",           color: "bg-accent-fuchsia/15 text-accent-fuchsia", order: 4 },
  suporte:          { label: "Suporte",           color: "bg-accent-emerald/15 text-accent-emerald", order: 5 },
  concluido:        { label: "Concluído",         color: "bg-white/5 text-white/30",                 order: 6 },
};

export function ProjectsPage() {
  const { profile } = useAuth();
  const canEdit = hasPermission(profile?.role, "projects:edit");
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const [pSnap, cSnap] = await Promise.all([
          getDocs(query(collection(db, "projects"), orderBy("createdAt", "desc"))),
          getDocs(collection(db, "clients")),
        ]);
        setProjects(pSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Project)));
        setClients(cSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Client)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetch();
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id: string, status: ProjectStatus) => {
    if (!canEdit) return;
    const now = new Date().toISOString();
    const update: any = { status, updatedAt: now };
    if (status === "concluido") update.completedDate = now;
    await updateDoc(doc(db, "projects", id), update);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...update } : p)));
  };

  return (
    <>
      <TopBar title="Projetos" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Pesquisar projetos..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:border-accent-blue/50 focus:outline-none" />
          </div>
          {canEdit && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90">
              <Plus size={16} /> Novo Projeto
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-blue" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => {
              const st = STATUS_MAP[project.status];
              return (
                <div key={project.id} className="rounded-2xl border border-white/5 bg-ink-900/40 p-5 backdrop-blur hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-accent-violet/10 p-2.5 text-accent-violet"><FolderKanban size={20} /></div>
                      <div>
                        <h3 className="text-sm font-semibold">{project.name}</h3>
                        <p className="text-[10px] text-white/30">{project.clientName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    {canEdit ? (
                      <select value={project.status} onChange={(e) => updateStatus(project.id, e.target.value as ProjectStatus)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none">
                        {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    ) : (
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", st.color)}>{st.label}</span>
                    )}
                    <span className="text-[10px] text-white/20">{new Date(project.createdAt).toLocaleDateString("pt-PT")}</span>
                  </div>
                  {project.targetDate && (
                    <p className="mt-2 text-[10px] text-white/30">Meta: {new Date(project.targetDate).toLocaleDateString("pt-PT")}</p>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && <p className="col-span-full py-12 text-center text-sm text-white/30">Sem projetos.</p>}
          </div>
        )}
      </div>

      {showForm && canEdit && (
        <ProjectFormModal clients={clients} onClose={() => setShowForm(false)} onCreated={(p) => { setProjects((prev) => [p, ...prev]); setShowForm(false); }} userId={profile!.uid} />
      )}
    </>
  );
}

function ProjectFormModal({ clients, onClose, onCreated, userId }: { clients: Client[]; onClose: () => void; onCreated: (p: Project) => void; userId: string }) {
  const [form, setForm] = useState({ name: "", clientId: "", description: "", startDate: "", targetDate: "" });
  const [saving, setSaving] = useState(false);

  const clientName = clients.find((c) => c.id === form.clientId)?.company ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const data = {
        name: form.name,
        clientId: form.clientId,
        clientName,
        description: form.description || undefined,
        status: "kickoff" as const,
        assignedTo: [userId],
        phases: [],
        startDate: form.startDate || now,
        targetDate: form.targetDate || undefined,
        createdAt: now,
        updatedAt: now,
      };
      const ref = await addDoc(collection(db, "projects"), data);
      onCreated({ id: ref.id, ...data } as Project);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl border border-white/5 bg-ink-900/95 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Novo Projeto</h2><button type="button" onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="mb-1 block text-xs text-white/50">Nome *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" /></div>
            <div className="col-span-2"><label className="mb-1 block text-xs text-white/50">Cliente *</label><select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"><option value="">Selecionar...</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}</select></div>
            <div><label className="mb-1 block text-xs text-white/50">Data início</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" /></div>
            <div><label className="mb-1 block text-xs text-white/50">Data alvo</label><input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" /></div>
            <div className="col-span-2"><label className="mb-1 block text-xs text-white/50">Descrição</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none resize-none" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50">{saving ? "A guardar..." : "Criar Projeto"}</button>
          </div>
        </form>
      </div>
    </>
  );
}
