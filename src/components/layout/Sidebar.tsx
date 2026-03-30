"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useInfluencerStore } from "@/store/useInfluencerStore";
import { revokeRefreshOnServer } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Layers,
  DollarSign,
  UserCircle,
  LogOut,
  Link as LinkIcon,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Sections", href: "/sections", icon: Layers },
  { name: "Earnings", href: "/earnings", icon: DollarSign },
  { name: "Profile", href: "/profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useInfluencerStore();

  const handleLogout = async () => {
    const rt = useInfluencerStore.getState().refreshToken;
    await revokeRefreshOnServer(rt);
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-slate-200 flex flex-col z-50">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-100">
            <span className="text-white font-bold">D</span>
          </div>
          <span className="text-slate-900 font-bold text-lg tracking-tight">
            Influencer
          </span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-bold",
                isActive
                  ? "bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  "transition-colors",
                  isActive
                    ? "text-emerald-700"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="px-4 pb-2">
          <div className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-400 truncate">
            <LinkIcon size={14} />
            <span className="truncate">
              decume.in/{(user as any).username || "..."}
            </span>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all text-sm font-bold"
        >
          <LogOut size={20} className="text-slate-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
