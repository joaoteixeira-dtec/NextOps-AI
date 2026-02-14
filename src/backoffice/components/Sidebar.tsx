import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { hasPermission, ROLE_LABELS, type Permission } from "../../lib/permissions";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  FolderKanban,
  CheckSquare,
  Receipt,
  UserCog,
  BarChart3,
  LogOut,
  ChevronLeft,
  Menu,
  Settings,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";

type NavItem = {
  label: string;
  path: string;
  icon: ReactNode;
  permission: Permission;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",   path: "/backoffice",           icon: <LayoutDashboard size={20} />, permission: "dashboard:view" },
  { label: "CRM",         path: "/backoffice/crm",       icon: <Users size={20} />,           permission: "crm:view" },
  { label: "Clientes",    path: "/backoffice/clientes",  icon: <Building2 size={20} />,       permission: "clients:view" },
  { label: "Propostas",   path: "/backoffice/propostas", icon: <FileText size={20} />,         permission: "proposals:view" },
  { label: "Projetos",    path: "/backoffice/projetos",  icon: <FolderKanban size={20} />,     permission: "projects:view" },
  { label: "Tarefas",     path: "/backoffice/tarefas",   icon: <CheckSquare size={20} />,      permission: "tasks:view" },
  { label: "Faturação",   path: "/backoffice/faturacao", icon: <Receipt size={20} />,          permission: "invoices:view" },
  { label: "Equipa",      path: "/backoffice/equipa",    icon: <UserCog size={20} />,          permission: "team:view" },
  { label: "Relatórios",  path: "/backoffice/relatorios",icon: <BarChart3 size={20} />,        permission: "reports:view" },
  { label: "Definições",  path: "/backoffice/definicoes",icon: <Settings size={20} />,         permission: "settings:view" },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter((item) =>
    hasPermission(profile?.role, item.permission)
  );

  const linkClasses = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-accent-blue/15 text-accent-blue shadow-glow-sm"
        : "text-white/60 hover:bg-white/5 hover:text-white"
    );

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <img
          src="/nextopsai-logo-1.png"
          alt="NextOps AI"
          className="h-8 w-8 rounded-lg"
        />
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold truncate">NextOps AI</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Backoffice</p>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/backoffice"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => linkClasses(isActive)}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Sign Out */}
      <div className="border-t border-white/5 px-3 py-4 space-y-3">
        {!collapsed && profile && (
          <div className="px-3">
            <p className="text-sm font-medium truncate">{profile.name}</p>
            <p className="text-xs text-white/40">{ROLE_LABELS[profile.role]}</p>
          </div>
        )}
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          {!collapsed && "Sair"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-ink-800/90 p-2 text-white/70 backdrop-blur lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-ink-900/95 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-ink-900/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 rounded-full bg-ink-800 border border-white/10 p-1 text-white/50 hover:text-white transition-colors"
          aria-label={collapsed ? "Expandir" : "Recolher"}
        >
          <ChevronLeft
            size={14}
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </aside>

      {/* Spacer for desktop layout */}
      <div
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}
      />
    </>
  );
}
