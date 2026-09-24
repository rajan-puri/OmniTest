"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  FileCode2,
  PlayCircle,
  BarChart3,
  Boxes,
  Settings,
  LogOut,
  Terminal,
  ChevronDown,
  Building2,
  Plus,
  Loader2,
  User as UserIcon,
} from "lucide-react";

interface Org {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface DashboardNavProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
  };
  activeOrg: {
    id: string;
    name: string;
    slug: string;
  } | null;
  userRole: string;
  organizations: Org[];
}

export function DashboardNav({ user, activeOrg, userRole, organizations }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/dashboard/projects", icon: FolderGit2 },
    { label: "Tests", href: "/dashboard/tests", icon: FileCode2 },
    { label: "Test Runs", href: "/dashboard/runs", icon: PlayCircle },
    { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { label: "Integrations", href: "/dashboard/integrations", icon: Boxes },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-full md:w-64 bg-[#0A0C10] border-b md:border-b-0 md:border-r border-white/[0.08] flex flex-col justify-between shrink-0">
      <div>
        {/* Brand header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-brand-500/20">
              <Terminal className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">OmniTest</span>
          </Link>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400">
            {userRole}
          </span>
        </div>

        {/* Organization Switcher */}
        <div className="p-3 border-b border-white/[0.06] relative">
          <button
            type="button"
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            className="w-full p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Building2 className="w-4 h-4 text-brand-400 shrink-0" />
              <div className="truncate">
                <span className="block text-xs font-semibold text-white truncate">
                  {activeOrg?.name || "Workspace"}
                </span>
                <span className="block text-[10px] font-mono text-zinc-400 truncate">
                  {activeOrg?.slug || "personal"}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          </button>

          {orgDropdownOpen && (
            <div className="absolute top-full left-3 right-3 mt-1.5 p-1 rounded-xl glass-panel-elevated border border-white/[0.1] shadow-2xl z-50 animate-in fade-in-50">
              <div className="text-[10px] font-mono uppercase px-2 py-1 text-zinc-500 font-semibold">
                Your Organizations
              </div>
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className={`w-full px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    org.id === activeOrg?.id
                      ? "bg-brand-500/15 text-brand-300 font-semibold"
                      : "text-zinc-300 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="truncate">{org.name}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{org.role}</span>
                </div>
              ))}
              <div className="pt-1 mt-1 border-t border-white/[0.06]">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOrgDropdownOpen(false)}
                  className="w-full px-2 py-1.5 rounded-lg text-xs text-brand-400 hover:bg-brand-500/10 flex items-center gap-1.5 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Organization
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1" aria-label="Dashboard Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-brand-500/15 text-brand-400 border border-brand-500/30 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-400" : "text-zinc-500"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-3 border-t border-white/[0.06] space-y-2">
        <div className="p-2 rounded-xl bg-white/[0.02] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-zinc-300 font-bold text-xs shrink-0">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="truncate flex-1">
            <span className="block text-xs font-semibold text-white truncate">
              {user.fullName}
            </span>
            <span className="block text-[10px] font-mono text-zinc-500 truncate">
              {user.email}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
