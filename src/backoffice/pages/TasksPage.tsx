import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { hasPermission } from "../../lib/permissions";
import { TopBar } from "../components/TopBar";
import type { Task, TaskStatus, TaskPriority } from "../../lib/types";
import { cn } from "../../lib/cn";
import { Plus, Search, CheckSquare, Circle, Clock, CheckCircle2, XCircle, X } from "lucide-react";

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  pendente: <Circle size={16} className="text-white/30" />,
  "em-curso": <Clock size={16} className="text-accent-blue" />,
  concluida: <CheckCircle2 size={16} className="text-accent-emerald" />,
  cancelada: <XCircle size={16} className="text-white/20" />,
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  baixa: "bg-white/10 text-white/40",
  media: "bg-accent-blue/15 text-accent-blue",
  alta: "bg-orange-500/15 text-orange-400",
  urgente: "bg-red-500/15 text-red-400",
};

export function TasksPage() {
  const { profile } = useAuth();
  const canEdit = hasPermission(profile?.role, "tasks:edit");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "mine" | "completed">("all");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(query(collection(db, "tasks"), orderBy("createdAt", "desc")));
        setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetch();
  }, []);

  let filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );
  if (filter === "mine") filtered = filtered.filter((t) => t.assignedTo === profile?.uid);
  if (filter === "completed") filtered = filtered.filter((t) => t.status === "concluida");
  if (filter === "all") filtered = filtered.filter((t) => t.status !== "cancelada");

  const toggleStatus = async (task: Task) => {
    if (!canEdit) return;
    const now = new Date().toISOString();
    const newStatus: TaskStatus = task.status === "concluida" ? "pendente" : task.status === "pendente" ? "em-curso" : "concluida";
    const update: any = { status: newStatus, updatedAt: now };
    if (newStatus === "concluida") update.completedAt = now;
    await updateDoc(doc(db, "tasks", task.id), update);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...update } : t)));
  };

  return (
    <>
      <TopBar title="Tarefas" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Pesquisar tarefas..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:border-accent-blue/50 focus:outline-none" />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {([["all", "Todas"], ["mine", "Minhas"], ["completed", "Concluídas"]] as const).map(([k, label]) => (
              <button key={k} onClick={() => setFilter(k)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", filter === k ? "bg-accent-blue/20 text-accent-blue" : "text-white/40 hover:text-white/70")}>
                {label}
              </button>
            ))}
          </div>
          {canEdit && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90">
              <Plus size={16} /> Nova Tarefa
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-blue" /></div>
        ) : (
          <div className="space-y-2">
            {filtered.map((task) => (
              <div key={task.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-ink-900/40 px-4 py-3 backdrop-blur hover:border-white/10 transition-colors">
                <button onClick={() => toggleStatus(task)} className="shrink-0" disabled={!canEdit}>
                  {STATUS_ICONS[task.status]}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", task.status === "concluida" && "line-through text-white/30")}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.linkedName && <span className="text-[10px] text-white/25">{task.linkedName}</span>}
                    {task.assignedToName && <span className="text-[10px] text-accent-blue/50">@{task.assignedToName}</span>}
                    {task.dueDate && <span className="text-[10px] text-white/20">Até {new Date(task.dueDate).toLocaleDateString("pt-PT")}</span>}
                  </div>
                </div>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", PRIORITY_COLORS[task.priority])}>
                  {task.priority}
                </span>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-12 text-center text-sm text-white/30">Sem tarefas.</p>
            )}
          </div>
        )}
      </div>

      {showForm && canEdit && (
        <TaskFormModal profile={profile!} onClose={() => setShowForm(false)} onCreated={(t) => { setTasks((prev) => [t, ...prev]); setShowForm(false); }} />
      )}
    </>
  );
}

function TaskFormModal({ profile, onClose, onCreated }: { profile: { uid: string; name: string }; onClose: () => void; onCreated: (t: Task) => void }) {
  const [form, setForm] = useState({ title: "", description: "", priority: "media" as TaskPriority, dueDate: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const data = {
        title: form.title,
        description: form.description || undefined,
        status: "pendente" as const,
        priority: form.priority,
        assignedTo: profile.uid,
        assignedToName: profile.name,
        dueDate: form.dueDate || undefined,
        createdBy: profile.uid,
        createdAt: now,
        updatedAt: now,
      };
      const ref = await addDoc(collection(db, "tasks"), data);
      onCreated({ id: ref.id, ...data } as Task);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-white/5 bg-ink-900/95 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Nova Tarefa</h2><button type="button" onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button></div>
          <div><label className="mb-1 block text-xs text-white/50">Título *</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" /></div>
          <div><label className="mb-1 block text-xs text-white/50">Descrição</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-xs text-white/50">Prioridade</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="urgente">Urgente</option></select></div>
            <div><label className="mb-1 block text-xs text-white/50">Data limite</label><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50">{saving ? "A guardar..." : "Criar Tarefa"}</button>
          </div>
        </form>
      </div>
    </>
  );
}
