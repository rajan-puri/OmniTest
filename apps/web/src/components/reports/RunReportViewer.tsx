"use client";

import React, { useState } from "react";
import { RunReport } from "@/lib/reports/report-types";
import { ReportHeader } from "./ReportHeader";
import { ReportSummaryCards } from "./ReportSummaryCards";
import { ReportTypeBreakdown } from "./ReportTypeBreakdown";
import { ReportFailuresSection } from "./ReportFailuresSection";
import { ReportResultsTable } from "./ReportResultsTable";

interface RunReportViewerProps {
  report: RunReport;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function RunReportViewer({
  report,
  onRefresh,
  isRefreshing = false,
}: RunReportViewerProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner & Meta */}
      <ReportHeader
        report={report}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Summary Stat Cards */}
      <ReportSummaryCards summary={report.summary} />

      {/* Testing Engine Breakdown Cards */}
      <ReportTypeBreakdown
        breakdown={report.breakdown}
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      {/* Failure Highlights Section (shown if there are failed/error tests) */}
      {(report.failures.length > 0 || report.errors.length > 0) && (
        <ReportFailuresSection
          failures={report.failures}
          errors={report.errors}
          projectId={report.project.id}
          runId={report.testRunId}
        />
      )}

      {/* Comprehensive Results Table */}
      <div className="space-y-2">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
          All Test Results
        </h2>
        <ReportResultsTable
          items={report.items}
          selectedType={selectedType}
          onSelectType={setSelectedType}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          projectId={report.project.id}
          runId={report.testRunId}
        />
      </div>
    </div>
  );
}
