import { useAuth } from "../../contexts/AuthContext";
import { Bell, Search } from "lucide-react";

export function TopBar({ title }: { title: string }) {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-ink-950/80 backdrop-blur-xl px-6 py-4 lg:px-8">
      <div className="pl-10 lg:pl-0">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search (placeholder) */}
        <button className="rounded-xl bg-white/5 p-2 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors">
          <Search size={18} />
        </button>

        {/* Notifications (placeholder) */}
        <button className="relative rounded-xl bg-white/5 p-2 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors">
          <Bell size={18} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent-blue" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center text-xs font-bold">
            {profile?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <span className="hidden text-sm font-medium md:inline">
            {profile?.name?.split(" ")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
