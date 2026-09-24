export type ArtifactType =
  | "SCREENSHOT"
  | "VIDEO"
  | "PLAYWRIGHT_TRACE"
  | "CONSOLE_LOG"
  | "NETWORK_LOG"
  | "HTTP_RESPONSE"
  | "API_REQUEST"
  | "API_RESPONSE"
  | "PERFORMANCE_EVIDENCE"
  | "A11Y_EVIDENCE"
  | "SEO_EVIDENCE"
  | "JSON"
  | "TEXT"
  | "HTML"
  | "VISUAL_BASELINE"
  | "VISUAL_CURRENT"
  | "VISUAL_DIFF";

export interface ArtifactMetadata {
  width?: number;
  height?: number;
  durationMs?: number;
  linesCount?: number;
  itemsCount?: number;
  engine?: string;
  statusCode?: number;
  method?: string;
  url?: string;
  violationsCount?: number;
  lcpMs?: number;
  cls?: number;
  [key: string]: any;
}

export interface ArtifactItem {
  id: string;
  testRunId: string;
  testResultId: string;
  type: ArtifactType;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  formattedSize: string;
  url: string;
  downloadUrl: string;
  createdAt: string;
  isVirtual?: boolean;
  metadata?: ArtifactMetadata;
}

export interface TestResultArtifactsResponse {
  project: {
    id: string;
    name: string;
    slug: string;
  };
  testRun: {
    id: string;
    status: string;
    trigger: string;
    environment: string;
    createdAt: string;
  };
  testResult: {
    id: string;
    testId: string | null;
    testTitle: string;
    testType: string;
    status: string;
    durationMs: number;
    errorMessage: string | null;
    createdAt: string;
  };
  artifacts: ArtifactItem[];
}
