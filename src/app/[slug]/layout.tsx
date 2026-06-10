"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  UtensilsCrossed,
  KanbanSquare,
  QrCode,
  Clock,
  LogOut,
  ChefHat,
  Loader2,
  Menu,
  X,
  Settings,
} from "lucide-react";

const sidebarLinks = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "menu-management", label: "Menu", icon: UtensilsCrossed },
  { key: "orders", label: "Orders", icon: KanbanSquare },
  { key: "tables", label: "Tables", icon: QrCode },
  { key: "history", label: "History", icon: Clock },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hydrate } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const slug = params.slug as string;

  // Check if this is the public customer menu page
  const isCustomerPage = pathname.includes("/menu/table/");

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (ready && !isCustomerPage) {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated || state.user?.role !== "owner") {
        router.push("/login");
      }
    }
  }, [ready, router, isCustomerPage]);

  // For customer pages, just render children directly (no dashboard layout)
  if (isCustomerPage) {
    return <>{children}</>;
  }

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const activeKey = pathname.split("/").pop() || "dashboard";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">TableQ</p>
              <p className="text-xs text-gray-400 truncate">{slug}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((item) => (
            <Link
              key={item.key}
              href={`/${slug}/${item.key}`}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeKey === item.key
                  ? "bg-[#10b981]/10 text-[#059669]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex-1" />
          <span className="text-sm text-gray-400">{user.email}</span>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
