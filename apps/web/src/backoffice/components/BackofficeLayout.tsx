import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function BackofficeLayout() {
  return (
    <div className="flex min-h-screen bg-ink-950 text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
