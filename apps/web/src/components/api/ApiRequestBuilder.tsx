"use client";

import React, { useState } from "react";
import {
  Send,
  Plus,
  Trash2,
  Lock,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code2,
  Settings2,
  FileJson,
} from "lucide-react";
import {
  ApiTestSpec,
  HttpMethod,
  ApiParam,
  ApiHeader,
  ApiAuthConfig,
  ApiAssertion,
  ApiAssertionType,
} from "@/lib/runner/api-types";

interface ApiRequestBuilderProps {
  initialSpec?: Partial<ApiTestSpec>;
  baseUrl?: string;
  onChange: (spec: ApiTestSpec) => void;
  onSendTest?: (spec: ApiTestSpec) => void;
  isExecuting?: boolean;
}

export function ApiRequestBuilder({
  initialSpec,
  baseUrl,
  onChange,
  onSendTest,
  isExecuting = false,
}: ApiRequestBuilderProps) {
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "body" | "auth" | "assertions">("params");

  const [method, setMethod] = useState<HttpMethod>(initialSpec?.method || "GET");
  const [url, setUrl] = useState<string>(initialSpec?.url || baseUrl || "https://api.example.com/users");
  
  const [params, setParams] = useState<ApiParam[]>(
    initialSpec?.params && initialSpec.params.length > 0
      ? initialSpec.params
      : [{ key: "", value: "", enabled: true }]
  );

  const [headers, setHeaders] = useState<ApiHeader[]>(
    initialSpec?.headers && initialSpec.headers.length > 0
      ? initialSpec.headers
      : [
          { key: "Accept", value: "application/json", enabled: true },
          { key: "Content-Type", value: "application/json", enabled: true },
        ]
  );

  const [bodyType, setBodyType] = useState<"none" | "json">(initialSpec?.bodyType || (method === "GET" ? "none" : "json"));
  const [body, setBody] = useState<string>(
    initialSpec?.body || (method !== "GET" ? '{\n  "name": "Jane Doe"\n}' : "")
  );

  const [auth, setAuth] = useState<ApiAuthConfig>(
    initialSpec?.auth || { type: "none" }
  );

  const [assertions, setAssertions] = useState<ApiAssertion[]>(
    initialSpec?.assertions && initialSpec.assertions.length > 0
      ? initialSpec.assertions
      : [
          { id: "assert_1", type: "status_equals", expected: "200" },
          { id: "assert_2", type: "response_time_lt", expected: "1000" },
        ]
  );

  const [bodyJsonError, setBodyJsonError] = useState<string | null>(null);

  // Sync state upward
  const notifyChange = (updated: Partial<ApiTestSpec>) => {
    const fullSpec: ApiTestSpec = {
      version: "1.0",
      method: updated.method ?? method,
      url: updated.url ?? url,
      params: updated.params ?? params.filter((p) => p.key.trim() !== ""),
      headers: updated.headers ?? headers.filter((h) => h.key.trim() !== ""),
      bodyType: updated.bodyType ?? bodyType,
      body: updated.body ?? (bodyType === "json" ? body : undefined),
      auth: updated.auth ?? auth,
      assertions: updated.assertions ?? assertions,
      timeoutMs: updated.timeoutMs ?? 10000,
    };
    onChange(fullSpec);
  };

  const handleMethodChange = (newMethod: HttpMethod) => {
    setMethod(newMethod);
    const newBodyType = (newMethod === "POST" || newMethod === "PUT" || newMethod === "PATCH") ? "json" : bodyType;
    setBodyType(newBodyType);
    notifyChange({ method: newMethod, bodyType: newBodyType });
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    notifyChange({ url: newUrl });
  };

  // Param management
  const updateParam = (idx: number, field: keyof ApiParam, val: any) => {
    const next = params.map((p, i) => (i === idx ? { ...p, [field]: val } : p));
    setParams(next);
    notifyChange({ params: next.filter((p) => p.key.trim() !== "") });
  };

  const addParam = () => {
    const next = [...params, { key: "", value: "", enabled: true }];
    setParams(next);
  };

  const removeParam = (idx: number) => {
    const next = params.filter((_, i) => i !== idx);
    setParams(next.length === 0 ? [{ key: "", value: "", enabled: true }] : next);
    notifyChange({ params: next.filter((p) => p.key.trim() !== "") });
  };

  // Header management
  const updateHeader = (idx: number, field: keyof ApiHeader, val: any) => {
    const next = headers.map((h, i) => (i === idx ? { ...h, [field]: val } : h));
    setHeaders(next);
    notifyChange({ headers: next.filter((h) => h.key.trim() !== "") });
  };

  const addHeader = () => {
    const next = [...headers, { key: "", value: "", enabled: true }];
    setHeaders(next);
  };

  const removeHeader = (idx: number) => {
    const next = headers.filter((_, i) => i !== idx);
    setHeaders(next.length === 0 ? [{ key: "", value: "", enabled: true }] : next);
    notifyChange({ headers: next.filter((h) => h.key.trim() !== "") });
  };

  // Body management
  const handleBodyChange = (raw: string) => {
    setBody(raw);
    if (bodyType === "json" && raw.trim()) {
      try {
        JSON.parse(raw);
        setBodyJsonError(null);
      } catch (err: any) {
        setBodyJsonError(err.message);
      }
    } else {
      setBodyJsonError(null);
    }
    notifyChange({ body: raw });
  };

  // Auth management
  const handleAuthChange = (field: keyof ApiAuthConfig, val: any) => {
    const nextAuth = { ...auth, [field]: val };
    setAuth(nextAuth);
    notifyChange({ auth: nextAuth });
  };

  // Assertion management
  const updateAssertion = (idx: number, field: keyof ApiAssertion, val: any) => {
    const next = assertions.map((a, i) => (i === idx ? { ...a, [field]: val } : a));
    setAssertions(next);
    notifyChange({ assertions: next });
  };

  const addAssertion = (type: ApiAssertionType) => {
    const newId = `assert_${assertions.length + 1}_${Date.now()}`;
    let defaultProp = "";
    let defaultExp = "";

    switch (type) {
      case "status_equals":
        defaultExp = "200";
        break;
      case "response_time_lt":
        defaultExp = "1000";
        break;
      case "json_property_exists":
        defaultProp = "data.id";
        break;
      case "json_property_equals":
        defaultProp = "success";
        defaultExp = "true";
        break;
      case "json_property_contains":
        defaultProp = "message";
        defaultExp = "ok";
        break;
      case "body_contains":
        defaultExp = "Welcome";
        break;
      case "header_exists":
        defaultProp = "Content-Type";
        break;
      case "header_equals":
        defaultProp = "Content-Type";
        defaultExp = "application/json";
        break;
    }

    const next = [...assertions, { id: newId, type, property: defaultProp, expected: defaultExp }];
    setAssertions(next);
    notifyChange({ assertions: next });
  };

  const removeAssertion = (idx: number) => {
    const next = assertions.filter((_, i) => i !== idx);
    setAssertions(next);
    notifyChange({ assertions: next });
  };

  const getMethodColor = (m: HttpMethod) => {
    switch (m) {
      case "GET":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "POST":
        return "text-brand-400 bg-brand-500/10 border-brand-500/30";
      case "PUT":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "PATCH":
        return "text-violet-400 bg-violet-500/10 border-violet-500/30";
      case "DELETE":
        return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Address Bar (Method + URL + Send Button) */}
      <div className="p-3 rounded-2xl glass-panel-elevated border border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Method selector */}
        <div className="relative shrink-0">
          <select
            value={method}
            onChange={(e) => handleMethodChange(e.target.value as HttpMethod)}
            aria-label="HTTP Method"
            className={`w-full sm:w-28 px-3 py-2.5 rounded-xl font-mono text-xs font-bold uppercase border focus:outline-none transition-colors appearance-none cursor-pointer ${getMethodColor(
              method
            )}`}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        {/* URL Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://api.example.com/v1/users or /api/users"
            aria-label="Request URL"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs font-mono placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>

        {/* Direct Send button if provided */}
        {onSendTest && (
          <button
            type="button"
            disabled={isExecuting || !url.trim()}
            onClick={() =>
              onSendTest({
                version: "1.0",
                method,
                url,
                params: params.filter((p) => p.key.trim() !== ""),
                headers: headers.filter((h) => h.key.trim() !== ""),
                bodyType,
                body: bodyType === "json" ? body : undefined,
                auth,
                assertions,
                timeoutMs: 10000,
              })
            }
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition-all shrink-0 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 fill-current" />
            Send Request
          </button>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 border-b border-white/[0.08] pb-1 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab("params")}
          className={`px-3.5 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "params"
              ? "bg-white/[0.08] text-white font-bold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Params
          {params.filter((p) => p.key).length > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-300 text-[10px] flex items-center justify-center font-bold">
              {params.filter((p) => p.key).length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("headers")}
          className={`px-3.5 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "headers"
              ? "bg-white/[0.08] text-white font-bold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Headers
          {headers.filter((h) => h.key).length > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-300 text-[10px] flex items-center justify-center font-bold">
              {headers.filter((h) => h.key).length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("body")}
          className={`px-3.5 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "body"
              ? "bg-white/[0.08] text-white font-bold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Body
          {bodyType === "json" && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("auth")}
          className={`px-3.5 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "auth"
              ? "bg-white/[0.08] text-white font-bold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Lock className="w-3 h-3 text-zinc-400" />
          Auth
          {auth.type !== "none" && (
            <span className="px-1 rounded bg-brand-500/20 text-brand-400 text-[10px] font-bold uppercase">
              {auth.type}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("assertions")}
          className={`px-3.5 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "assertions"
              ? "bg-white/[0.08] text-white font-bold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Assertions
          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center font-bold">
            {assertions.length}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-5 rounded-2xl glass-panel-elevated border border-white/[0.08] min-h-[260px]">
        {/* TAB 1: Query Params */}
        {activeTab === "params" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono pb-2 border-b border-white/[0.06]">
              <span>Query Parameters</span>
              <button
                type="button"
                onClick={addParam}
                className="text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Param
              </button>
            </div>

            <div className="space-y-2">
              {params.map((param, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={param.enabled !== false}
                    onChange={(e) => updateParam(idx, "enabled", e.target.checked)}
                    className="rounded bg-black/40 border-white/[0.1] text-brand-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) => updateParam(idx, "key", e.target.value)}
                    placeholder="Key (e.g. page)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => updateParam(idx, "value", e.target.value)}
                    placeholder="Value (e.g. 1)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeParam(idx)}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Headers */}
        {activeTab === "headers" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono pb-2 border-b border-white/[0.06]">
              <span>Request Headers</span>
              <button
                type="button"
                onClick={addHeader}
                className="text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Header
              </button>
            </div>

            <div className="space-y-2">
              {headers.map((hdr, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hdr.enabled !== false}
                    onChange={(e) => updateHeader(idx, "enabled", e.target.checked)}
                    className="rounded bg-black/40 border-white/[0.1] text-brand-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={hdr.key}
                    onChange={(e) => updateHeader(idx, "key", e.target.value)}
                    placeholder="Header (e.g. Content-Type)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <input
                    type="text"
                    value={hdr.value}
                    onChange={(e) => updateHeader(idx, "value", e.target.value)}
                    placeholder="Value (e.g. application/json)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeHeader(idx)}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Request Body */}
        {activeTab === "body" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 text-xs font-mono">
                <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="bodyType"
                    checked={bodyType === "none"}
                    onChange={() => {
                      setBodyType("none");
                      notifyChange({ bodyType: "none" });
                    }}
                    className="text-brand-500 focus:ring-0"
                  />
                  none
                </label>
                <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="bodyType"
                    checked={bodyType === "json"}
                    onChange={() => {
                      setBodyType("json");
                      notifyChange({ bodyType: "json" });
                    }}
                    className="text-brand-500 focus:ring-0"
                  />
                  JSON (application/json)
                </label>
              </div>

              {bodyJsonError ? (
                <span className="text-[11px] font-mono text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Invalid JSON
                </span>
              ) : bodyType === "json" ? (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid JSON
                </span>
              ) : null}
            </div>

            {bodyType === "json" ? (
              <div>
                <textarea
                  value={body}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  rows={8}
                  placeholder='{\n  "key": "value"\n}'
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500 font-mono">
                This request does not have a request body.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Authentication */}
        {activeTab === "auth" && (
          <div className="space-y-4 max-w-xl">
            <div className="space-y-1">
              <label className="block text-xs font-mono text-zinc-400">Authentication Type</label>
              <select
                value={auth.type}
                onChange={(e) => handleAuthChange("type", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="none">No Auth (None)</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="api_key">API Key</option>
              </select>
            </div>

            {/* Bearer Token */}
            {auth.type === "bearer" && (
              <div className="space-y-2 p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                <label className="block text-xs font-mono text-zinc-300">Bearer Token</label>
                <input
                  type="password"
                  value={auth.bearerToken || ""}
                  onChange={(e) => handleAuthChange("bearerToken", e.target.value)}
                  placeholder="e.g. eyJhbGciOiJIUzI1NiIsIn..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <p className="text-[11px] font-mono text-zinc-500">
                  Transmitted as <code className="text-zinc-400">Authorization: Bearer &lt;token&gt;</code>. Masked in reports.
                </p>
              </div>
            )}

            {/* Basic Auth */}
            {auth.type === "basic" && (
              <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={auth.basicUsername || ""}
                    onChange={(e) => handleAuthChange("basicUsername", e.target.value)}
                    placeholder="Username"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={auth.basicPassword || ""}
                    onChange={(e) => handleAuthChange("basicPassword", e.target.value)}
                    placeholder="Password"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            {/* API Key */}
            {auth.type === "api_key" && (
              <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Key Name</label>
                  <input
                    type="text"
                    value={auth.apiKeyName || "x-api-key"}
                    onChange={(e) => handleAuthChange("apiKeyName", e.target.value)}
                    placeholder="e.g. x-api-key"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Key Value</label>
                  <input
                    type="password"
                    value={auth.apiKeyValue || ""}
                    onChange={(e) => handleAuthChange("apiKeyValue", e.target.value)}
                    placeholder="API Secret Key"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Transmit In</label>
                  <select
                    value={auth.apiKeyLocation || "header"}
                    onChange={(e) => handleAuthChange("apiKeyLocation", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="header">Request Header</option>
                    <option value="query">Query Parameter</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Assertions */}
        {activeTab === "assertions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-xs text-zinc-400 font-mono">
                API Response Assertions ({assertions.length})
              </span>

              {/* Add Assertion Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-500">+ Add:</span>
                <button
                  type="button"
                  onClick={() => addAssertion("status_equals")}
                  className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-zinc-300"
                >
                  Status Code
                </button>
                <button
                  type="button"
                  onClick={() => addAssertion("response_time_lt")}
                  className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-zinc-300"
                >
                  Response Time
                </button>
                <button
                  type="button"
                  onClick={() => addAssertion("json_property_equals")}
                  className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-zinc-300"
                >
                  JSON Property
                </button>
                <button
                  type="button"
                  onClick={() => addAssertion("header_equals")}
                  className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-zinc-300"
                >
                  Header
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {assertions.map((assertion, idx) => (
                <div
                  key={assertion.id}
                  className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs font-mono"
                >
                  <span className="text-zinc-500 w-5">{idx + 1}.</span>
                  
                  {/* Assertion Type */}
                  <select
                    value={assertion.type}
                    onChange={(e) => updateAssertion(idx, "type", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-brand-300 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="status_equals">Status equals</option>
                    <option value="status_is_2xx">Status is 2xx</option>
                    <option value="status_is_4xx">Status is 4xx</option>
                    <option value="status_is_5xx">Status is 5xx</option>
                    <option value="response_time_lt">Response time &lt; (ms)</option>
                    <option value="json_property_exists">JSON property exists</option>
                    <option value="json_property_equals">JSON property equals</option>
                    <option value="json_property_contains">JSON property contains</option>
                    <option value="body_contains">Body contains text</option>
                    <option value="header_exists">Header exists</option>
                    <option value="header_equals">Header equals</option>
                  </select>

                  {/* Property field (e.g. JSON path or Header key) */}
                  {(assertion.type.startsWith("json_") || assertion.type.startsWith("header_")) && (
                    <input
                      type="text"
                      value={assertion.property || ""}
                      onChange={(e) => updateAssertion(idx, "property", e.target.value)}
                      placeholder={assertion.type.startsWith("json_") ? "Property (e.g. user.id)" : "Header Name"}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  )}

                  {/* Expected value field */}
                  {assertion.type !== "status_is_2xx" &&
                    assertion.type !== "status_is_4xx" &&
                    assertion.type !== "status_is_5xx" &&
                    assertion.type !== "json_property_exists" &&
                    assertion.type !== "header_exists" && (
                      <input
                        type="text"
                        value={assertion.expected || ""}
                        onChange={(e) => updateAssertion(idx, "expected", e.target.value)}
                        placeholder="Expected Value"
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    )}

                  <button
                    type="button"
                    onClick={() => removeAssertion(idx)}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 rounded transition-colors self-end sm:self-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
