const isColorSupported =
  Boolean(process.stdout.isTTY) &&
  !process.env.NO_COLOR &&
  process.env.TERM !== "dumb";

export const colors = {
  reset: isColorSupported ? "\x1b[0m" : "",
  bold: isColorSupported ? "\x1b[1m" : "",
  dim: isColorSupported ? "\x1b[2m" : "",
  green: isColorSupported ? "\x1b[32m" : "",
  red: isColorSupported ? "\x1b[31m" : "",
  yellow: isColorSupported ? "\x1b[33m" : "",
  cyan: isColorSupported ? "\x1b[36m" : "",
  magenta: isColorSupported ? "\x1b[35m" : "",
  gray: isColorSupported ? "\x1b[90m" : "",
};

export const symbols = {
  success: isColorSupported ? `${colors.green}✓${colors.reset}` : "[PASS]",
  failure: isColorSupported ? `${colors.red}✗${colors.reset}` : "[FAIL]",
  warning: isColorSupported ? `${colors.yellow}!${colors.reset}` : "[WARN]",
  info: isColorSupported ? `${colors.cyan}•${colors.reset}` : "*",
  arrow: isColorSupported ? `${colors.cyan}→${colors.reset}` : "->",
};

export function banner(subtitle?: string): void {
  console.log(`${colors.bold}${colors.cyan}OmniTest CLI${colors.reset}`);
  if (subtitle) {
    console.log(`${colors.dim}${subtitle}${colors.reset}`);
  }
  console.log(`${colors.gray}──────────────────────────────────────────────────${colors.reset}`);
}

export function divider(): void {
  console.log(`${colors.gray}──────────────────────────────────────────────────${colors.reset}`);
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function logError(title: string, details?: { reason?: string; status?: number; suggestion?: string }): void {
  console.error(`\n${symbols.failure} ${colors.bold}${colors.red}${title}${colors.reset}\n`);
  if (details?.reason) {
    console.error(`${colors.bold}Reason:${colors.reset}`);
    console.error(`  ${details.reason}\n`);
  }
  if (details?.status) {
    console.error(`${colors.bold}Status:${colors.reset} ${details.status}\n`);
  }
  if (details?.suggestion) {
    console.error(`${colors.bold}Suggestion:${colors.reset}`);
    console.error(`  ${details.suggestion}\n`);
  }
}

export function renderTable(headers: string[], rows: string[][]): void {
  const colWidths = headers.map((h, colIdx) => {
    const maxRowWidth = rows.reduce((max, row) => Math.max(max, (row[colIdx] || "").length), 0);
    return Math.max(h.length, maxRowWidth) + 2;
  });

  const headerLine = headers.map((h, i) => h.toUpperCase().padEnd(colWidths[i])).join("");
  console.log(`${colors.dim}${headerLine}${colors.reset}`);
  console.log(`${colors.gray}${"─".repeat(headerLine.length)}${colors.reset}`);

  for (const row of rows) {
    const rowLine = row.map((cell, i) => (cell || "").padEnd(colWidths[i])).join("");
    console.log(rowLine);
  }
}
