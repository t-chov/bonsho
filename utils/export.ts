import type { UsageRecord } from "./types";

export function usageToJSON(usage: UsageRecord): string {
  const entries = Object.entries(usage).map(([key, seconds]) => {
    const [date, site] = key.split("|");
    return { date, site, seconds };
  });
  return JSON.stringify(entries, null, 2);
}

export function usageToCSV(usage: UsageRecord): string {
  const lines = ["date,site,seconds"];
  for (const [key, seconds] of Object.entries(usage)) {
    const [date, site] = key.split("|");
    lines.push(`${date},${site},${seconds}`);
  }
  return lines.join("\n");
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
