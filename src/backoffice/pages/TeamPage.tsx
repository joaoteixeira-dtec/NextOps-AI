import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, orderBy, query } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { hasPermission, ROLE_LABELS, type Role } from "../../lib/permissions";
import { TopBar } from "../components/TopBar";
import type { UserProfile } from "../../lib/types";
import { cn } from "../../lib/cn";
import { Plus, Search, UserCog, X, Shield, Mail, Phone } from "lucide-react";

export function TeamPage() {
  const { profile } = useAuth();
  const canEdit = hasPermission(profile?.role, "team:edit");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
        setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetch();
  }, []);

  const toggleActive = async (uid: string, active: boolean) => {
    if (!canEdit) return;
    await updateDoc(doc(db, "users", uid), { active: !active });
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, active: !active } : u)));
  };

  const changeRole = async (uid: string, role: Role) => {
    if (!canEdit) return;
    await updateDoc(doc(db, "users", uid), { role });
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
  };

  return (
    <>
      <TopBar title="Equipa" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h2 className="text-lg font-semibold flex-1">{users.length} membros</h2>
          {canEdit && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90">
              <Plus size={16} /> Novo Membro
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-blue" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div key={user.uid} className={cn("rounded-2xl border bg-ink-900/40 p-5 backdrop-blur transition-colors", user.active ? "border-white/5 hover:border-white/10" : "border-red-500/10 opacity-60")}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center text-lg font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold truncate">{user.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Shield size={10} className="text-white/30" />
                      {canEdit && user.uid !== profile?.uid ? (
                        <select value={user.role} onChange={(e) => changeRole(user.uid, e.target.value as Role)} className="rounded bg-transparent text-xs text-white/50 focus:outline-none -ml-1">
                          <option value="admin">Administrador</option>
                          <option value="comercial">Comercial</option>
                          <option value="tecnico">Técnico</option>
                        </select>
                      ) : (
                        <span className="text-xs text-white/40">{ROLE_LABELS[user.role]}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-white/40">
                  <div className="flex items-center gap-2"><Mail size={12} /><span>{user.email}</span></div>
                  {user.phone && <div className="flex items-center gap-2"><Phone size={12} /><span>{user.phone}</span></div>}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <span className="text-[10px] text-white/20">
                    {user.lastLogin ? `Último login: ${new Date(user.lastLogin).toLocaleDateString("pt-PT")}` : "Nunca entrou"}
                  </span>
                  {canEdit && user.uid !== profile?.uid && (
                    <button onClick={() => toggleActive(user.uid, user.active)} className={cn("text-[10px] font-medium rounded-full px-2 py-0.5", user.active ? "text-red-400/70 hover:text-red-400" : "text-accent-emerald/70 hover:text-accent-emerald")}>
                      {user.active ? "Desativar" : "Ativar"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && canEdit && (
        <NewMemberModal
          onClose={() => setShowForm(false)}
          onCreated={(u) => { setUsers((prev) => [u, ...prev]); setShowForm(false); }}
        />
      )}
    </>
  );
}

function NewMemberModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: UserProfile) => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "comercial" as Role, phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      // Note: In production, user creation should be done via Admin SDK on the backend
      // This is a simplified version for the initial setup
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const now = new Date().toISOString();
      const userData: Omit<UserProfile, "uid"> = {
        email: form.email,
        name: form.name,
        role: form.role,
        phone: form.phone || undefined,
        active: true,
        createdAt: now,
      };
      await addDoc(collection(db, "users"), { ...userData });
      // Also set doc with uid as ID for easy lookup
      const { doc: docRef, setDoc } = await import("firebase/firestore");
      await setDoc(docRef(db, "users", cred.user.uid), userData);
      onCreated({ uid: cred.user.uid, ...userData } as UserProfile);
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        setError("Este email já está registado.");
      } else if (err?.code === "auth/weak-password") {
        setError("A password deve ter pelo menos 6 caracteres.");
      } else {
        setError("Erro ao criar utilizador.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-white/5 bg-ink-900/95 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Novo Membro</h2><button type="button" onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button></div>
          <div><label className="mb-1 block text-xs text-white/50">Nome *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" /></div>
          <div><label className="mb-1 block text-xs text-white/50">Email *</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" /></div>
          <div><label className="mb-1 block text-xs text-white/50">Password *</label><input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-xs text-white/50">Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"><option value="admin">Administrador</option><option value="comercial">Comercial</option><option value="tecnico">Técnico</option></select></div>
            <div><label className="mb-1 block text-xs text-white/50">Telefone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none" /></div>
          </div>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50">{saving ? "A criar..." : "Criar Membro"}</button>
          </div>
        </form>
      </div>
    </>
  );
}
