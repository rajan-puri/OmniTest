"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderGit2, ArrowLeft, Loader2, AlertCircle, Plus } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current user & active org
  useEffect(() => {
    async function loadOrg() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.activeOrg?.id) {
            setActiveOrgId(data.activeOrg.id);
          }
        }
      } catch (e) {
        console.error("Failed to load user org:", e);
      }
    }
    loadOrg();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activeOrgId) {
      setError("No active organization found. Please select or create an organization first.");
      return;
    }

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/organizations/${activeOrgId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          baseUrl,
          repositoryUrl,
          defaultBranch,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create project.");
      }

      router.push(`/dashboard/projects/${data.project.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Projects
      </Link>

      <div className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <FolderGit2 className="w-6 h-6 text-brand-400" />
          Create New Project
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure a project container to hold your test suites, environments, and execution history.
        </p>
      </div>

      <div className="glass-panel-elevated p-6 sm:p-8 rounded-2xl border border-white/[0.1] shadow-xl">
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Project Name <span className="text-rose-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. E-Commerce Webapp"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Description <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Primary storefront application for web & mobile consumers."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="baseUrl" className="block text-xs font-semibold text-zinc-200 mb-1.5">
                Target Staging Base URL <span className="text-zinc-500 font-normal">(optional)</span>
              </label>
              <input
                id="baseUrl"
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://staging.mystore.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="defaultBranch" className="block text-xs font-semibold text-zinc-200 mb-1.5">
                Default Branch
              </label>
              <input
                id="defaultBranch"
                type="text"
                value={defaultBranch}
                onChange={(e) => setDefaultBranch(e.target.value)}
                placeholder="main"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="repositoryUrl" className="block text-xs font-semibold text-zinc-200 mb-1.5">
              GitHub Repository URL <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <input
              id="repositoryUrl"
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/my-org/store"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            />
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <Link
              href="/dashboard/projects"
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-medium text-xs transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating Project...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
