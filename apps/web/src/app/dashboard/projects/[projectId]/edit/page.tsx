"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle, Save, Trash2 } from "lucide-react";

export default function EditProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const router = useRouter();
  const { projectId } = params;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) {
          throw new Error("Failed to load project details.");
        }
        const data = await res.json();
        const p = data.project;
        setName(p.name);
        setDescription(p.description || "");
        setBaseUrl(p.baseUrl || "");
        setRepositoryUrl(p.repositoryUrl || "");
        setDefaultBranch(p.defaultBranch || "main");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading project.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [projectId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
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
        throw new Error(data.error || "Failed to update project.");
      }

      router.push(`/dashboard/projects/${projectId}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update project.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete project.");
      }

      router.push("/dashboard/projects");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete project.");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-400 mx-auto mb-2" />
        <p className="text-xs text-zinc-400 font-mono">Loading project settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/dashboard/projects/${projectId}`}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Project
      </Link>

      <div className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl font-bold tracking-tight text-white">Project Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Update application target configurations or manage project lifecycle.
        </p>
      </div>

      <div className="glass-panel-elevated p-6 sm:p-8 rounded-2xl border border-white/[0.1] shadow-xl">
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="baseUrl" className="block text-xs font-semibold text-zinc-200 mb-1.5">
                Target Staging Base URL
              </label>
              <input
                id="baseUrl"
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://staging.mystore.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="repositoryUrl" className="block text-xs font-semibold text-zinc-200 mb-1.5">
              GitHub Repository URL
            </label>
            <input
              id="repositoryUrl"
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/my-org/store"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            />
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <Link
              href={`/dashboard/projects/${projectId}`}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-medium text-xs transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Delete Project */}
      <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/25 space-y-4">
        <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-400" />
          Danger Zone
        </h3>
        <p className="text-xs text-zinc-400">
          Permanently delete this project along with all associated test suites, execution logs, and artifacts.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Deleting Project...
            </>
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" />
              Delete This Project
            </>
          )}
        </button>
      </div>
    </div>
  );
}
