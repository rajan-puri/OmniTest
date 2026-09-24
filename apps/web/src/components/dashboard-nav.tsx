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
  X,
  Copy,
  Check,
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
  const [cliModalOpen, setCliModalOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const mainNavItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/dashboard/projects", icon: FolderGit2 },
    { label: "Tests", href: "/dashboard/tests", icon: FileCode2 },
    { label: "Test Runs", href: "/dashboard/runs", icon: PlayCircle },
    { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  ];

  const developerNavItems = [
    { label: "Integrations", href: "/dashboard/integrations", icon: Boxes },
  ];

  const workspaceNavItems = [
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

  const copyCliCode = () => {
    navigator.clipboard.writeText("npm run omnitest status");
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const renderNavLink = (item: { label: string; href: string; icon: any }) => {
    const Icon = item.icon;
    const isActive =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
          isActive
            ? "bg-white/[0.08] text-white font-semibold"
            : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-emerald-500 rounded-full" />
        )}
        <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-400"}`} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <aside className="w-full md:w-56 bg-[#0B0D12] border-b md:border-b-0 md:border-r border-white/[0.08] flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Header Brand */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-white/[0.06]">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-zinc-900 border border-white/[0.12] flex items-center justify-center text-emerald-400">
                <Terminal className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span className="font-semibold text-xs tracking-tight text-white">OmniTest</span>
              <span className="text-[10px] font-mono text-zinc-400 px-1 py-0.2 rounded bg-white/[0.05]">
                v0.1
              </span>
            </Link>
          </div>

          {/* Organization Switcher */}
          <div className="p-2.5 border-b border-white/[0.06] relative">
            <button
              type="button"
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              className="w-full px-2 py-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <div className="truncate">
                  <span className="block text-xs font-medium text-white truncate">
                    {activeOrg?.name || "Workspace"}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
            </button>

            {orgDropdownOpen && (
              <div className="absolute top-full left-2.5 right-2.5 mt-1 p-1 rounded-md bg-[#13151D] border border-white/[0.12] shadow-xl z-50">
                <div className="text-[10px] font-mono uppercase px-2 py-1 text-zinc-400 font-semibold tracking-wider">
                  Organizations
                </div>
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    className={`w-full px-2 py-1 rounded text-xs flex items-center justify-between transition-colors ${
                      org.id === activeOrg?.id
                        ? "bg-white/[0.08] text-white font-medium"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    <span className="text-[10px] font-mono text-zinc-400">{org.role}</span>
                  </div>
                ))}
                <div className="pt-1 mt-1 border-t border-white/[0.06]">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setOrgDropdownOpen(false)}
                    className="w-full px-2 py-1 rounded text-xs text-zinc-300 hover:text-white hover:bg-white/[0.04] flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" />
                    Manage Organizations
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Sections */}
          <div className="p-2 space-y-4">
            {/* Core Workflow */}
            <div className="space-y-0.5">
              {mainNavItems.map(renderNavLink)}
            </div>

            {/* Developer Section */}
            <div className="pt-2 border-t border-white/[0.06]">
              <span className="px-2.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                Developer
              </span>
              <div className="space-y-0.5">
                {developerNavItems.map(renderNavLink)}
                <button
                  type="button"
                  onClick={() => setCliModalOpen(true)}
                  className="w-full group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-400" />
                  <span>CLI</span>
                  <span className="ml-auto text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-white/[0.06] text-zinc-400">
                    agy
                  </span>
                </button>
              </div>
            </div>

            {/* Workspace Section */}
            <div className="pt-2 border-t border-white/[0.06]">
              <span className="px-2.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                Workspace
              </span>
              <div className="space-y-0.5">
                {workspaceNavItems.map(renderNavLink)}
              </div>
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-2.5 border-t border-white/[0.06] space-y-1.5">
          <div className="px-2 py-1.5 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-zinc-800 border border-white/[0.1] flex items-center justify-center text-zinc-300 font-medium text-[11px] shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="truncate flex-1">
              <span className="block text-xs font-medium text-zinc-200 truncate">
                {user.fullName}
              </span>
              <span className="block text-[10px] font-mono text-zinc-400 truncate">
                {user.email}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full px-2 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Signing out...
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

      {/* CLI Quick Reference Modal */}
      {cliModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111319] border border-white/[0.12] rounded-lg max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">OmniTest Developer CLI</h3>
              </div>
              <button
                type="button"
                onClick={() => setCliModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Execute, monitor, and query tests across your local environment or CI pipeline using the native zero-bloat CLI.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>QUICK RUN</span>
                <button
                  type="button"
                  onClick={copyCliCode}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                >
                  {copiedSnippet ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedSnippet ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="p-3 bg-[#0A0C10] border border-white/[0.08] rounded font-mono text-xs text-zinc-200 overflow-x-auto">
                <code>npm run omnitest run --project {activeOrg?.slug || "proj_123"}</code>
              </pre>
            </div>

            <div className="space-y-1 text-xs text-zinc-400">
              <div className="font-semibold text-zinc-300 text-[11px] uppercase tracking-wider font-mono">
                Key Commands:
              </div>
              <ul className="space-y-1 font-mono text-[11px]">
                <li><span className="text-emerald-400">omnitest init</span> — Initialize configuration</li>
                <li><span className="text-emerald-400">omnitest run --type ui --visual</span> — Run visual tests</li>
                <li><span className="text-emerald-400">omnitest history --limit 10</span> — Query test history</li>
                <li><span className="text-emerald-400">omnitest report --open</span> — Open report in dashboard</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={() => setCliModalOpen(false)}
                className="px-3 py-1.5 text-xs rounded bg-white/[0.08] hover:bg-white/[0.12] text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
