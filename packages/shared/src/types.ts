/* ── Roles & Permissions ── */

export type Role = "admin" | "comercial" | "tecnico";

export type Permission =
  | "dashboard:view"
  | "crm:view" | "crm:edit" | "crm:delete"
  | "clients:view" | "clients:edit" | "clients:delete"
  | "proposals:view" | "proposals:edit" | "proposals:delete"
  | "projects:view" | "projects:edit" | "projects:delete"
  | "tasks:view" | "tasks:edit" | "tasks:delete"
  | "invoices:view" | "invoices:edit" | "invoices:delete"
  | "team:view" | "team:edit" | "team:delete"
  | "reports:view";

/* ── Landing Page Lead Form ── */

export type LeadPayload = {
  company: string;
  name: string;
  email: string;
  phone?: string;
  employees?: string;
  industry?: string;
  message?: string;
  consent: boolean;
  source: "website";
  timestamp: string;
};

/* ── Backoffice Types ── */

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
};

export type LeadStatus =
  | "novo"
  | "contactado"
  | "qualificado"
  | "proposta"
  | "negociacao"
  | "ganho"
  | "perdido";

export type Lead = {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  employees?: string;
  industry?: string;
  message?: string;
  status: LeadStatus;
  assignedTo?: string;
  notes: LeadNote[];
  source: "website" | "manual" | "referral";
  value?: number;
  createdAt: string;
  updatedAt: string;
};

export type LeadNote = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export type Client = {
  id: string;
  company: string;
  nif?: string;
  address?: string;
  contacts: ClientContact[];
  industry?: string;
  leadId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ClientContact = {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  primary: boolean;
};

export type ProposalStatus = "rascunho" | "enviada" | "aceite" | "recusada";

export type Proposal = {
  id: string;
  clientId: string;
  clientName: string;
  leadId?: string;
  title: string;
  items: ProposalItem[];
  total: number;
  status: ProposalStatus;
  validUntil: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ProposalItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type ProjectStatus =
  | "kickoff"
  | "configuracao"
  | "desenvolvimento"
  | "testes"
  | "go-live"
  | "suporte"
  | "concluido";

export type Project = {
  id: string;
  clientId: string;
  clientName: string;
  proposalId?: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  assignedTo: string[];
  phases: ProjectPhase[];
  startDate: string;
  targetDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectPhase = {
  id: string;
  name: string;
  status: "pendente" | "em-curso" | "concluida";
  tasks: string[];
  order: number;
};

export type TaskPriority = "baixa" | "media" | "alta" | "urgente";
export type TaskStatus = "pendente" | "em-curso" | "concluida" | "cancelada";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  assignedToName?: string;
  linkedType?: "lead" | "client" | "project";
  linkedId?: string;
  linkedName?: string;
  dueDate?: string;
  completedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceStatus = "rascunho" | "emitida" | "paga" | "vencida" | "cancelada";

export type Invoice = {
  id: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  number: string;
  items: ProposalItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ActivityAction =
  | "lead_created" | "lead_updated" | "lead_status_changed"
  | "client_created" | "client_updated"
  | "proposal_created" | "proposal_sent" | "proposal_accepted" | "proposal_rejected"
  | "project_created" | "project_status_changed"
  | "task_created" | "task_completed"
  | "invoice_created" | "invoice_paid"
  | "user_login";

export type ActivityLog = {
  id: string;
  userId: string;
  userName: string;
  action: ActivityAction;
  entity: string;
  entityId: string;
  entityName?: string;
  details?: string;
  timestamp: string;
};
