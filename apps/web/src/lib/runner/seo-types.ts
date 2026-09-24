export type SeoSeverity = "ERROR" | "WARNING" | "INFO" | "PASS";

export type SeoCategory =
  | "technical"
  | "metadata"
  | "indexability"
  | "headings"
  | "images"
  | "links"
  | "social"
  | "structured_data"
  | "mobile";

export interface SeoCheckCategories {
  technical?: boolean;
  metadata?: boolean;
  indexability?: boolean;
  headings?: boolean;
  images?: boolean;
  links?: boolean;
  social?: boolean;
  structuredData?: boolean;
  robotsTxt?: boolean;
  sitemap?: boolean;
  mobile?: boolean;
}

export interface SeoAssertions {
  titleRequired?: boolean;
  metaDescriptionRequired?: boolean;
  canonicalRequired?: boolean;
  h1Required?: boolean;
  noindexDisallowed?: boolean;
  expectedStatusCode?: number;
  structuredDataRequired?: boolean;
  maxRedirects?: number;
  noBrokenLinks?: boolean;
}

export interface SeoTestSpec {
  version: "1.0";
  url: string;
  timeoutSeconds?: number;
  checks?: SeoCheckCategories;
  assertions?: SeoAssertions;
}

export interface SeoFinding {
  id: string;
  category: SeoCategory;
  severity: SeoSeverity;
  status: "PASSED" | "FAILED" | "WARNING" | "INFO";
  title: string;
  description: string;
  actual: string;
  expected?: string;
  evidence?: string;
  recommendation?: string;
}

export interface SeoRedirectStep {
  url: string;
  status: number;
}

export interface SeoImageItem {
  src: string;
  alt: string | null;
  isDecorative: boolean;
  hasDimensions: boolean;
  loading?: string | null;
}

export interface SeoLinkItem {
  url: string;
  text: string;
  status: number | null;
  isInternal: boolean;
  ok: boolean;
  error?: string;
}

export interface SeoJsonLdItem {
  type: string | null;
  validJson: boolean;
  rawPreview: string;
  error?: string;
}

export interface SeoPageDetails {
  title: {
    value: string | null;
    length: number;
  };
  metaDescription: {
    value: string | null;
    length: number;
  };
  canonical: {
    value: string | null;
    isSelfReferential: boolean;
    isAbsolute: boolean;
    hasMultiple: boolean;
  };
  robotsMeta: {
    raw: string | null;
    directives: string[];
    isNoindex: boolean;
    isNofollow: boolean;
  };
  xRobotsTag: {
    raw: string | null;
    directives: string[];
    isNoindex: boolean;
    isNofollow: boolean;
  };
  headings: {
    h1Count: number;
    h1Texts: string[];
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    emptyHeadingsCount: number;
    hierarchyIssues: string[];
  };
  images: {
    total: number;
    withAlt: number;
    missingAlt: number;
    decorative: number;
    lazyLoaded: number;
    items: SeoImageItem[];
  };
  links: {
    total: number;
    internal: number;
    external: number;
    missingHref: number;
    emptyText: number;
    checkedLinks: SeoLinkItem[];
  };
  openGraph: {
    title: string | null;
    description: string | null;
    image: string | null;
    url: string | null;
    type: string | null;
    allTags: Record<string, string>;
  };
  twitter: {
    card: string | null;
    title: string | null;
    description: string | null;
    image: string | null;
    allTags: Record<string, string>;
  };
  structuredData: {
    jsonLdDetected: boolean;
    jsonLdItems: SeoJsonLdItem[];
    microdataDetected: boolean;
    rdfaDetected: boolean;
  };
  htmlLang: string | null;
  viewport: string | null;
  mobileSignals: {
    hasViewportMeta: boolean;
    hasResponsiveImages: boolean;
    contentWidthOverflowDetected: boolean;
  };
  robotsTxt: {
    url: string;
    fetched: boolean;
    status: number | null;
    sitemaps: string[];
    disallows: string[];
    relevantRule: string | null;
    isPathDisallowed: boolean;
    error?: string;
  };
  sitemap: {
    discoveredUrl: string | null;
    status: number | null;
    accessible: boolean;
    validXml: boolean;
    urlCount: number;
    error?: string;
  };
  indexability: {
    isIndexable: boolean;
    signals: {
      httpStatusOk: boolean;
      noindexPresent: boolean;
      canonicalPresent: boolean;
      robotsTxtAllowed: boolean;
    };
    reasons: string[];
  };
}

export interface SeoAssertionResult {
  id: string;
  description: string;
  passed: boolean;
  actual: string;
  expected: string;
  errorMessage?: string;
}

export interface SeoExecutionResult {
  url: string;
  finalUrl: string;
  httpStatus: number;
  httpStatusText: string;
  redirectChain: SeoRedirectStep[];
  durationMs: number;
  status: "PASSED" | "FAILED";
  summary: {
    totalChecks: number;
    errors: number;
    warnings: number;
    info: number;
    passed: number;
  };
  findings: SeoFinding[];
  pageDetails: SeoPageDetails;
  assertions: SeoAssertionResult[];
  screenshotUrl?: string;
  errorSummary?: string;
}
