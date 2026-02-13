import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  rectIntersection,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { hasPermission } from "../../lib/permissions";
import { TopBar } from "../components/TopBar";
import type { Lead, LeadStatus, LeadNote } from "../../lib/types";
import { cn } from "../../lib/cn";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  MessageSquare,
  X,
  GripVertical,
  User,
  ArrowRight,
  CheckCircle,
  XCircle,
  FileText,
  UserPlus,
} from "lucide-react";

/* ═══════════════════ Constants ═══════════════════ */

const STATUSES: { key: LeadStatus; label: string; color: string }[] = [
  { key: "novo", label: "Novo", color: "bg-white/20 text-white/70" },
  { key: "contactado", label: "Contactado", color: "bg-accent-cyan/15 text-accent-cyan" },
  { key: "qualificado", label: "Qualificado", color: "bg-accent-blue/15 text-accent-blue" },
  { key: "proposta", label: "Proposta", color: "bg-accent-violet/15 text-accent-violet" },
  { key: "negociacao", label: "Negociação", color: "bg-accent-fuchsia/15 text-accent-fuchsia" },
  { key: "ganho", label: "Ganho", color: "bg-accent-emerald/15 text-accent-emerald" },
  { key: "perdido", label: "Perdido", color: "bg-red-500/15 text-red-400" },
];

type View = "kanban" | "list";

/* ═══════════════════ Droppable Column ═══════════════════ */

function KanbanColumn({
  statusKey,
  statusLabel,
  statusColor,
  isOver,
  isEmpty,
  children,
}: {
  statusKey: string;
  statusLabel: string;
  statusColor: string;
  isOver: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: `column-${statusKey}` });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-72 shrink-0 rounded-2xl border bg-ink-900/30 backdrop-blur transition-all duration-200",
        isOver
          ? "border-accent-blue/40 bg-accent-blue/5 ring-2 ring-accent-blue/20"
          : "border-white/5"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusColor)}>
            {statusLabel}
          </span>
        </div>
      </div>
      <div className={cn(
        "space-y-2 p-3 max-h-[calc(100vh-280px)] overflow-y-auto min-h-[80px] transition-colors",
        isOver && "bg-accent-blue/[0.03]"
      )}>
        {children}
        {isEmpty && (
          <p className={cn(
            "py-8 text-center text-xs",
            isOver ? "text-accent-blue/60 font-medium" : "text-white/20"
          )}>
            {isOver ? "↓ Soltar aqui" : "Sem leads"}
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════ Draggable Card ═══════════════════ */

function DraggableLeadCard({
  lead,
  canEdit,
  onSelect,
}: {
  lead: Lead;
  canEdit: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: lead.id,
    disabled: !canEdit,
    data: { lead },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full text-left rounded-xl border border-white/5 bg-ink-900/50 p-4 hover:border-white/10 transition-colors group",
        isDragging && "opacity-30 scale-95 z-50"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <button
          onClick={onSelect}
          className="text-sm font-semibold truncate pr-2 text-left hover:text-accent-blue transition-colors flex-1"
        >
          {lead.company}
        </button>
        {canEdit && (
          <button
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing rounded p-1 hover:bg-white/10 transition-colors touch-none shrink-0"
            title="Arrastar para mover"
          >
            <GripVertical size={16} className="text-white/20 group-hover:text-white/50" />
          </button>
        )}
      </div>
      <div onClick={onSelect} className="cursor-pointer">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <User size={12} />
            <span className="truncate">{lead.contactName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Mail size={12} />
            <span className="truncate">{lead.email}</span>
          </div>
          {lead.value && (
            <p className="text-xs font-medium text-accent-emerald">
              {lead.value.toLocaleString("pt-PT")} €
            </p>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-white/20">
            {new Date(lead.createdAt).toLocaleDateString("pt-PT")}
          </span>
          {lead.notes.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-white/30">
              <MessageSquare size={10} />
              {lead.notes.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ Overlay Card (ghost while dragging) ═══════════════════ */

function OverlayCard({ lead }: { lead: Lead }) {
  return (
    <div className="w-72 rounded-xl border border-accent-blue/30 bg-ink-900 p-4 shadow-2xl shadow-black/50 ring-2 ring-accent-blue/20 rotate-2 scale-105">
      <p className="text-sm font-semibold mb-2">{lead.company}</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <User size={12} />
          <span className="truncate">{lead.contactName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Mail size={12} />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.value && (
          <p className="text-xs font-medium text-accent-emerald">
            {lead.value.toLocaleString("pt-PT")} €
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════ Main CRM Page ═══════════════════ */

export function CRMPage() {
  const { profile } = useAuth();
  const canEdit = hasPermission(profile?.role, "crm:edit");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("kanban");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showForm, setShowForm] = useState(false);

  /* ── DnD state ── */
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<LeadStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const fetchLeads = async () => {
    try {
      const snap = await getDocs(
        query(collection(db, "leads"), orderBy("createdAt", "desc"))
      );
      setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lead)));
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = leads.filter(
    (l) =>
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.contactName.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
  );

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    if (!canEdit) return;
    await updateDoc(doc(db, "leads", leadId), {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, status: newStatus, updatedAt: new Date().toISOString() }
          : l
      )
    );
  };

  const addNote = async (leadId: string, content: string) => {
    if (!profile || !canEdit) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const newNote: LeadNote = {
      id: crypto.randomUUID(),
      authorId: profile.uid,
      authorName: profile.name,
      content,
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [...lead.notes, newNote];
    await updateDoc(doc(db, "leads", leadId), {
      notes: updatedNotes,
      updatedAt: new Date().toISOString(),
    });
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes: updatedNotes } : l))
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, notes: updatedNotes });
    }
  };

  /* ── DnD handlers ── */
  const resolveColumn = (id: string | number): LeadStatus | null => {
    const str = String(id);
    if (str.startsWith("column-")) {
      return str.replace("column-", "") as LeadStatus;
    }
    const lead = leads.find((l) => l.id === str);
    return lead?.status ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!event.over) {
      setOverColumn(null);
      return;
    }
    setOverColumn(resolveColumn(event.over.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverColumn(null);
    if (!over) return;

    const leadId = active.id as string;
    const targetStatus = resolveColumn(over.id);
    if (!targetStatus) return;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === targetStatus) return;

    await updateLeadStatus(leadId, targetStatus);
  };

  const activeLead = activeId
    ? leads.find((l) => l.id === activeId)
    : null;

  return (
    <>
      <TopBar title="CRM — Pipeline" />
      <div className="flex-1 overflow-hidden flex flex-col p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="Pesquisar leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:border-accent-blue/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                view === "kanban"
                  ? "bg-accent-blue/20 text-accent-blue"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              Kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                view === "list"
                  ? "bg-accent-blue/20 text-accent-blue"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              Lista
            </button>
          </div>

          {canEdit && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 transition-colors"
            >
              <Plus size={16} />
              Nova Lead
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-blue" />
          </div>
        ) : view === "kanban" ? (
          /* ── Kanban View with @dnd-kit ── */
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-4 min-w-max pb-4">
                {STATUSES.map((status) => {
                  const columnLeads = filtered.filter(
                    (l) => l.status === status.key
                  );
                  return (
                    <KanbanColumn
                      key={status.key}
                      statusKey={status.key}
                      statusLabel={status.label}
                      statusColor={status.color}
                      isOver={overColumn === status.key && activeId !== null}
                      isEmpty={columnLeads.length === 0}
                    >
                      {columnLeads.map((lead) => (
                        <DraggableLeadCard
                          key={lead.id}
                          lead={lead}
                          canEdit={canEdit}
                          onSelect={() => setSelectedLead(lead)}
                        />
                      ))}
                    </KanbanColumn>
                  );
                })}
              </div>
            </div>

            <DragOverlay dropAnimation={null}>
              {activeLead ? <OverlayCard lead={activeLead} /> : null}
            </DragOverlay>
          </DndContext>
        ) : (
          /* ── List View ── */
          <div className="flex-1 overflow-y-auto rounded-2xl border border-white/5 bg-ink-900/30 backdrop-blur">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Contacto</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => {
                  const statusDef = STATUSES.find(
                    (s) => s.key === lead.status
                  );
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{lead.company}</td>
                      <td className="px-4 py-3 text-white/60">
                        {lead.contactName}
                      </td>
                      <td className="px-4 py-3 text-white/60">{lead.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            statusDef?.color
                          )}
                        >
                          {statusDef?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60">
                        {lead.value
                          ? `${lead.value.toLocaleString("pt-PT")} €`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">
                        {new Date(lead.createdAt).toLocaleDateString("pt-PT")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="py-12 text-center text-sm text-white/30">
                {search
                  ? "Nenhuma lead encontrada."
                  : "Sem leads registadas."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Lead Detail Slide-over ── */}
      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          canEdit={canEdit}
          onClose={() => setSelectedLead(null)}
          onStatusChange={(s) => {
            updateLeadStatus(selectedLead.id, s);
            setSelectedLead({ ...selectedLead, status: s });
          }}
          onAddNote={(content) => addNote(selectedLead.id, content)}
        />
      )}

      {/* ── New Lead Form Modal ── */}
      {showForm && canEdit && (
        <NewLeadModal
          onClose={() => setShowForm(false)}
          onCreated={(lead) => {
            setLeads((prev) => [lead, ...prev]);
            setShowForm(false);
          }}
          profile={profile!}
        />
      )}
    </>
  );
}

/* ═══════════════════ Lead Detail Panel ═══════════════════ */

function LeadDetail({
  lead,
  canEdit,
  onClose,
  onStatusChange,
  onAddNote,
}: {
  lead: Lead;
  canEdit: boolean;
  onClose: () => void;
  onStatusChange: (s: LeadStatus) => void;
  onAddNote: (content: string) => void;
}) {
  const [noteText, setNoteText] = useState("");

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-ink-900/95 backdrop-blur-xl border-l border-white/5 p-6 animate-slide-up">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{lead.company}</h2>
            <p className="text-sm text-white/40">{lead.contactName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/40 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status */}
        {canEdit && (
          <div className="mb-6">
            <label className="mb-2 block text-xs font-medium text-white/40 uppercase tracking-wider">
              Estado
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => onStatusChange(s.key)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-all border",
                    lead.status === s.key
                      ? s.color + " border-current"
                      : "border-white/5 text-white/30 hover:border-white/10"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {canEdit && (
          <div className="mb-6">
            <label className="mb-2 block text-xs font-medium text-white/40 uppercase tracking-wider">
              Ações Rápidas
            </label>
            <div className="flex flex-wrap gap-2">
              {lead.status === "novo" && (
                <button
                  onClick={() => onStatusChange("contactado")}
                  className="flex items-center gap-1.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 px-3 py-2 text-xs font-medium text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
                >
                  <Phone size={13} />
                  Marcar como Contactado
                </button>
              )}
              {lead.status === "contactado" && (
                <>
                  <button
                    onClick={() => onStatusChange("qualificado")}
                    className="flex items-center gap-1.5 rounded-xl bg-accent-blue/10 border border-accent-blue/20 px-3 py-2 text-xs font-medium text-accent-blue hover:bg-accent-blue/20 transition-colors"
                  >
                    <CheckCircle size={13} />
                    Qualificar Lead
                  </button>
                  <button
                    onClick={() => onStatusChange("perdido")}
                    className="flex items-center gap-1.5 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle size={13} />
                    Sem Interesse
                  </button>
                </>
              )}
              {lead.status === "qualificado" && (
                <button
                  onClick={() => onStatusChange("proposta")}
                  className="flex items-center gap-1.5 rounded-xl bg-accent-violet/10 border border-accent-violet/20 px-3 py-2 text-xs font-medium text-accent-violet hover:bg-accent-violet/20 transition-colors"
                >
                  <FileText size={13} />
                  Criar Proposta
                </button>
              )}
              {lead.status === "proposta" && (
                <button
                  onClick={() => onStatusChange("negociacao")}
                  className="flex items-center gap-1.5 rounded-xl bg-accent-fuchsia/10 border border-accent-fuchsia/20 px-3 py-2 text-xs font-medium text-accent-fuchsia hover:bg-accent-fuchsia/20 transition-colors"
                >
                  <ArrowRight size={13} />
                  Entrar em Negociação
                </button>
              )}
              {lead.status === "negociacao" && (
                <>
                  <button
                    onClick={() => onStatusChange("ganho")}
                    className="flex items-center gap-1.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 px-3 py-2 text-xs font-medium text-accent-emerald hover:bg-accent-emerald/20 transition-colors"
                  >
                    <CheckCircle size={13} />
                    Marcar como Ganho
                  </button>
                  <button
                    onClick={() => onStatusChange("perdido")}
                    className="flex items-center gap-1.5 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle size={13} />
                    Perdido
                  </button>
                </>
              )}
              {lead.status === "ganho" && (
                <button
                  onClick={() => {
                    /* TODO: navigate to clients + convert */
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 px-3 py-2 text-xs font-medium text-accent-emerald hover:bg-accent-emerald/20 transition-colors"
                >
                  <UserPlus size={13} />
                  Converter a Cliente
                </button>
              )}
              {lead.status === "perdido" && (
                <button
                  onClick={() => onStatusChange("novo")}
                  className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 transition-colors"
                >
                  <ArrowRight size={13} />
                  Reabrir Lead
                </button>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={14} className="text-white/30" />
            <a
              href={`mailto:${lead.email}`}
              className="text-accent-blue hover:underline"
            >
              {lead.email}
            </a>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone size={14} className="text-white/30" />
              <a href={`tel:${lead.phone}`} className="text-white/70">
                {lead.phone}
              </a>
            </div>
          )}
          {lead.industry && (
            <div className="flex items-center gap-3 text-sm">
              <Building2 size={14} className="text-white/30" />
              <span className="text-white/70">{lead.industry}</span>
            </div>
          )}
          {lead.message && (
            <div className="rounded-xl bg-white/5 p-3 text-sm text-white/60">
              {lead.message}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <h3 className="mb-3 text-xs font-medium text-white/40 uppercase tracking-wider">
            Notas ({lead.notes.length})
          </h3>

          {canEdit && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Adicionar nota..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && noteText.trim()) {
                    onAddNote(noteText.trim());
                    setNoteText("");
                  }
                }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-accent-blue/50 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (noteText.trim()) {
                    onAddNote(noteText.trim());
                    setNoteText("");
                  }
                }}
                className="rounded-xl bg-accent-blue/20 px-3 py-2 text-sm text-accent-blue hover:bg-accent-blue/30 transition-colors"
              >
                Adicionar
              </button>
            </div>
          )}

          <div className="space-y-2">
            {lead.notes
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((note) => (
                <div key={note.id} className="rounded-xl bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white/60">
                      {note.authorName}
                    </span>
                    <span className="text-[10px] text-white/20">
                      {new Date(note.createdAt).toLocaleString("pt-PT")}
                    </span>
                  </div>
                  <p className="text-sm text-white/70">{note.content}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════ New Lead Modal ═══════════════════ */

function NewLeadModal({
  onClose,
  onCreated,
  profile,
}: {
  onClose: () => void;
  onCreated: (lead: Lead) => void;
  profile: { uid: string; name: string };
}) {
  const [form, setForm] = useState({
    company: "",
    contactName: "",
    email: "",
    phone: "",
    industry: "",
    message: "",
    value: "",
    source: "manual" as "manual" | "referral",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const data = {
        company: form.company,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone || undefined,
        industry: form.industry || undefined,
        message: form.message || undefined,
        value: form.value ? Number(form.value) : undefined,
        status: "novo" as const,
        assignedTo: profile.uid,
        notes: [],
        source: form.source,
        createdAt: now,
        updatedAt: now,
      };
      const ref = await addDoc(collection(db, "leads"), data);
      onCreated({ id: ref.id, ...data } as Lead);
    } catch (err) {
      console.error("Error creating lead:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg rounded-2xl border border-white/5 bg-ink-900/95 backdrop-blur-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Nova Lead</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-white/40 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-white/50">
                Empresa *
              </label>
              <input
                required
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">
                Nome do Contacto *
              </label>
              <input
                required
                value={form.contactName}
                onChange={(e) =>
                  setForm({ ...form, contactName: e.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">
                Email *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">
                Telefone
              </label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">
                Setor
              </label>
              <input
                value={form.industry}
                onChange={(e) =>
                  setForm({ ...form, industry: e.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">
                Valor Estimado (€)
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: e.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">
                Fonte
              </label>
              <select
                value={form.source}
                onChange={(e) =>
                  setForm({
                    ...form,
                    source: e.target.value as "manual" | "referral",
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none"
              >
                <option value="manual">Manual</option>
                <option value="referral">Referência</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-white/50">
                Mensagem
              </label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) =>
                  setForm({ ...form, message: e.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-blue/50 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "A guardar..." : "Criar Lead"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
