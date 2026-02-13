/* ──────────────────────── Roles & Permissions ──────────────────────── */

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

const PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "dashboard:view",
    "crm:view", "crm:edit", "crm:delete",
    "clients:view", "clients:edit", "clients:delete",
    "proposals:view", "proposals:edit", "proposals:delete",
    "projects:view", "projects:edit", "projects:delete",
    "tasks:view", "tasks:edit", "tasks:delete",
    "invoices:view", "invoices:edit", "invoices:delete",
    "team:view", "team:edit", "team:delete",
    "reports:view",
  ],
  comercial: [
    "dashboard:view",
    "crm:view", "crm:edit",
    "clients:view", "clients:edit",
    "proposals:view", "proposals:edit", "proposals:delete",
    "projects:view",
    "tasks:view", "tasks:edit",
    "invoices:view",
    "reports:view",
  ],
  tecnico: [
    "dashboard:view",
    "crm:view",
    "clients:view", "clients:edit",
    "proposals:view",
    "projects:view", "projects:edit",
    "tasks:view", "tasks:edit",
    "reports:view",
  ],
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return PERMISSIONS[role].includes(permission);
}

export function getPermissions(role: Role): Permission[] {
  return PERMISSIONS[role];
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  comercial: "Comercial",
  tecnico: "Técnico",
};
