"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  User as UserIcon,
  Building2,
  Users,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
} from "lucide-react";

interface MemberItem {
  id: string;
  role: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [activeOrg, setActiveOrg] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [role, setRole] = useState("MEMBER");
  const [newOrgName, setNewOrgName] = useState("");
  const [members, setMembers] = useState<MemberItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setFullName(data.user.fullName);
          setEmail(data.user.email);
          setActiveOrg(data.activeOrg);
          setRole(data.role);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsSavingProfile(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile.");
      }

      setSuccessMessage("Profile updated successfully.");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!newOrgName.trim()) {
      setErrorMessage("Organization name cannot be empty.");
      return;
    }

    setIsCreatingOrg(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newOrgName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create organization.");
      }

      setNewOrgName("");
      setSuccessMessage(`Organization "${data.organization.name}" created!`);
      router.refresh();
      window.location.reload();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to create organization.");
    } finally {
      setIsCreatingOrg(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-400 mx-auto mb-2" />
        <p className="text-xs text-zinc-400 font-mono">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-white/[0.08]">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-brand-400" />
          Account &amp; Organization Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your personal developer profile, team memberships, and organizations.
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="p-6 sm:p-8 rounded-2xl glass-panel-elevated border border-white/[0.08] space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.06]">
          <UserIcon className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-bold text-white">Your Profile</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              disabled
              value={email}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.05] text-zinc-400 text-sm cursor-not-allowed"
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Contact organization administrator to change primary account email.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {isSavingProfile ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Profile
              </>
            )}
          </button>
        </form>
      </div>

      {/* Active Organization Section */}
      <div className="p-6 sm:p-8 rounded-2xl glass-panel-elevated border border-white/[0.08] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Active Organization</h2>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/25">
            Your Role: {role}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-zinc-500 block mb-1">Organization Name</span>
            <span className="text-zinc-200 font-semibold">{activeOrg?.name}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-zinc-500 block mb-1">Workspace Slug</span>
            <span className="text-zinc-200 font-semibold">{activeOrg?.slug}</span>
          </div>
        </div>

        {/* Create new organization */}
        <div className="pt-6 border-t border-white/[0.06] space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Create Another Organization
          </h3>
          <p className="text-xs text-zinc-400">
            Need a separate isolated workspace for a client or different engineering team?
          </p>
          <form onSubmit={handleCreateOrg} className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <input
              type="text"
              required
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="e.g. Staging Labs"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isCreatingOrg}
              className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-xs border border-white/[0.08] transition-colors flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {isCreatingOrg ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Create
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
