"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  Square,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MousePointer,
  Navigation,
  Keyboard,
  ShieldCheck,
  Eye,
  Camera,
  Layers,
  ArrowRight,
} from "lucide-react";
import { TestStep, StepAction } from "@/lib/runner/types";
import { RecordedAction } from "@/lib/recorder/manager";

interface TestRecorderProps {
  projectId: string;
  defaultUrl: string;
  onStepsGenerated: (steps: TestStep[]) => void;
  onCancel?: () => void;
}

export function TestRecorder({
  projectId,
  defaultUrl,
  onStepsGenerated,
  onCancel,
}: TestRecorderProps) {
  const [targetUrl, setTargetUrl] = useState(defaultUrl || "https://example.com");
  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [actions, setActions] = useState<RecordedAction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Manual assertion form inputs
  const [assertType, setAssertType] = useState<"assert_visible" | "assert_text" | "assert_url" | "screenshot">("assert_visible");
  const [assertTarget, setAssertTarget] = useState("");
  const [assertValue, setAssertValue] = useState("");
  const [isAddingAssert, setIsAddingAssert] = useState(false);

  // Interactive web simulation helper
  const [simTarget, setSimTarget] = useState("");
  const [simText, setSimText] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll active session for newly captured browser events
  useEffect(() => {
    if (isRecording && sessionId) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/recorder/${sessionId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.actions) {
              setActions(data.actions);
            }
          }
        } catch {
          // Poll failures can be ignored
        }
      }, 1000);
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isRecording, sessionId]);

  const handleStartRecording = async () => {
    setError(null);
    if (!targetUrl.trim()) {
      setError("Please specify a target URL to start recording.");
      return;
    }

    setIsStarting(true);
    try {
      const res = await fetch("/api/recorder/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          url: targetUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start recorder session.");
      }

      setSessionId(data.sessionId);
      setActions(data.actions || []);
      setIsRecording(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to launch browser session.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopRecording = async () => {
    if (!sessionId) return;
    setIsStopping(true);
    setError(null);

    try {
      const res = await fetch(`/api/recorder/${sessionId}/stop`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to stop recording.");
      }

      setIsRecording(false);
      setSessionId(null);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      if (data.steps && data.steps.length > 0) {
        onStepsGenerated(data.steps);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate steps.");
    } finally {
      setIsStopping(false);
    }
  };

  const handleAddAssertion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    setIsAddingAssert(true);
    try {
      const res = await fetch(`/api/recorder/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "assertion",
          action: assertType,
          target: assertTarget || undefined,
          value: assertValue || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add assertion.");
      }

      if (data.action) {
        setActions((prev) => [...prev, data.action]);
      }
      setAssertTarget("");
      setAssertValue("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record assertion.");
    } finally {
      setIsAddingAssert(false);
    }
  };

  const handleSimulateInteraction = async (action: "click" | "fill" | "press" | "goto") => {
    if (!sessionId) return;

    setIsSimulating(true);
    try {
      const res = await fetch(`/api/recorder/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "interact",
          action,
          target: simTarget || (action === "press" ? "Enter" : undefined),
          value: simText || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send interaction.");
      }

      if (data.actions) {
        setActions(data.actions);
      }
      setSimTarget("");
      setSimText("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to interact.");
    } finally {
      setIsSimulating(false);
    }
  };

  const getActionIcon = (action: StepAction) => {
    switch (action) {
      case "goto":
        return <Navigation className="w-3.5 h-3.5 text-sky-400" />;
      case "click":
        return <MousePointer className="w-3.5 h-3.5 text-brand-400" />;
      case "fill":
      case "press":
        return <Keyboard className="w-3.5 h-3.5 text-violet-400" />;
      case "screenshot":
        return <Camera className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="rounded-2xl glass-panel-elevated border border-brand-500/30 overflow-hidden shadow-2xl space-y-0">
      {/* Header bar */}
      <div className="p-5 bg-gradient-to-r from-brand-950/60 via-zinc-900 to-black/60 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 shadow-inner">
            <Video className="w-5 h-5 animate-pulse text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Interactive Test Recorder
              </h2>
              {isRecording ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-[11px] font-mono text-rose-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  RECORDING
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[11px] font-mono text-zinc-400">
                  STANDBY
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Spawns an instrumented browser session to automatically capture clicks, inputs, and navigations into resilient Playwright steps.
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2.5">
          {!isRecording ? (
            <button
              type="button"
              disabled={isStarting}
              onClick={handleStartRecording}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Spawning Browser...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start Recording
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={isStopping}
              onClick={handleStopRecording}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
            >
              {isStopping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating Steps...
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Stop Recording &amp; Import
                </>
              )}
            </button>
          )}

          {onCancel && !isRecording && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-xs transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Body */}
      <div className="p-5 space-y-5">
        {/* URL Input Bar when standby */}
        {!isRecording && (
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
            <label htmlFor="recorder-url" className="block text-xs font-semibold text-zinc-300">
              Start URL for Recording Session
            </label>
            <div className="flex gap-2">
              <input
                id="recorder-url"
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://your-app.com or http://localhost:3000"
                className="flex-1 px-3.5 py-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <p className="text-[11px] font-mono text-zinc-500">
              Tip: The recorder will prioritize stable selectors (`data-testid`, semantic tag, name, id) over fragile classpaths.
            </p>
          </div>
        )}

        {/* Live Recording Stream & Controls */}
        {isRecording && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Live Event Stream */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-400" />
                  Captured Steps Stream ({actions.length})
                </span>
                <span className="text-[11px] font-mono text-brand-400 animate-pulse">
                  Listening for interactions...
                </span>
              </div>

              <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                {actions.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-black/30 border border-dashed border-white/[0.08] text-xs text-zinc-500 font-mono">
                    Navigate or click inside the browser to start capturing actions.
                  </div>
                ) : (
                  actions.map((act, idx) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-lg bg-black/50 border border-white/[0.08] hover:border-white/[0.15] transition-colors flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-white/[0.06] text-zinc-400 font-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {getActionIcon(act.action)}
                            <span className="font-mono font-bold uppercase text-[11px] text-zinc-200">
                              {act.action}
                            </span>
                            {act.value && (
                              <span className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono text-[10px] text-zinc-300">
                                {act.value}
                              </span>
                            )}
                          </div>
                          {act.target && (
                            <p className="font-mono text-[11px] text-brand-400/90 break-all">
                              {act.target}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* In-Session Interaction & Assertion Tools */}
            <div className="lg:col-span-5 space-y-4">
              {/* Add Assertion Panel */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Record Assertion
                  </h3>
                </div>

                <form onSubmit={handleAddAssertion} className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-1">
                      Assertion Type
                    </label>
                    <select
                      value={assertType}
                      onChange={(e) => setAssertType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="assert_visible">Assert Element Visible</option>
                      <option value="assert_text">Assert Element Contains Text</option>
                      <option value="assert_url">Assert Current URL</option>
                      <option value="screenshot">Capture Visual Proof</option>
                    </select>
                  </div>

                  {assertType !== "assert_url" && (
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 mb-1">
                        Selector (e.g. h1, [data-testid=&apos;submit&apos;])
                      </label>
                      <input
                        type="text"
                        value={assertTarget}
                        onChange={(e) => setAssertTarget(e.target.value)}
                        placeholder={assertType === "assert_visible" ? "body or button" : "h1"}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  )}

                  {(assertType === "assert_text" || assertType === "screenshot" || assertType === "assert_url") && (
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 mb-1">
                        {assertType === "assert_text" && "Expected Text"}
                        {assertType === "screenshot" && "Screenshot Name"}
                        {assertType === "assert_url" && "Expected URL Path Substring"}
                      </label>
                      <input
                        type="text"
                        value={assertValue}
                        onChange={(e) => setAssertValue(e.target.value)}
                        placeholder={assertType === "screenshot" ? "recorded_checkpoint" : "Dashboard"}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAddingAssert}
                    className="w-full py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isAddingAssert ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    Insert Assertion Step
                  </button>
                </form>
              </div>

              {/* Direct Page Command Dispatcher */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-1.5">
                  <MousePointer className="w-4 h-4 text-brand-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Dispatch Web Action
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-1">
                      Selector or Key
                    </label>
                    <input
                      type="text"
                      value={simTarget}
                      onChange={(e) => setSimTarget(e.target.value)}
                      placeholder="button, input[name='email'], or Enter"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-1">
                      Value (for fill or typing)
                    </label>
                    <input
                      type="text"
                      value={simText}
                      onChange={(e) => setSimText(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isSimulating || !simTarget}
                      onClick={() => handleSimulateInteraction("click")}
                      className="py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs font-mono border border-white/[0.06] transition-colors disabled:opacity-50"
                    >
                      Click
                    </button>
                    <button
                      type="button"
                      disabled={isSimulating || !simTarget}
                      onClick={() => handleSimulateInteraction("fill")}
                      className="py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs font-mono border border-white/[0.06] transition-colors disabled:opacity-50"
                    >
                      Fill
                    </button>
                    <button
                      type="button"
                      disabled={isSimulating}
                      onClick={() => handleSimulateInteraction("press")}
                      className="py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs font-mono border border-white/[0.06] transition-colors disabled:opacity-50"
                    >
                      Press Key
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-black/40 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500 px-5">
        <span>OmniTest Bi-Directional Recorder Engine</span>
        <span>Output: Standard TestSpec v1.0</span>
      </div>
    </div>
  );
}
