import type { UsageRecord } from './types';

/**
 * 使用時間記録をJSON形式の文字列に変換
 * @param {UsageRecord} usage - 使用時間記録オブジェクト
 * @returns {string} JSON形式の文字列（配列形式、インデント付き）
 */
export function usageToJSON(usage: UsageRecord): string {
  const entries = Object.entries(usage).map(([key, seconds]) => {
    const [date, site] = key.split('|');
    return { date, site, seconds };
  });
  return JSON.stringify(entries, null, 2);
}

/**
 * 使用時間記録をCSV形式の文字列に変換
 * @param {UsageRecord} usage - 使用時間記録オブジェクト
 * @returns {string} CSV形式の文字列（ヘッダー行付き）
 */
export function usageToCSV(usage: UsageRecord): string {
  const lines = ['date,site,seconds'];
  for (const [key, seconds] of Object.entries(usage)) {
    const [date, site] = key.split('|');
    lines.push(`${date},${site},${seconds}`);
  }
  return lines.join('\n');
}

/**
 * 文字列データをファイルとしてダウンロード
 * Blob URLを作成し、一時的なaタグを使ってダウンロードを実行
 * @param {string} content - ファイル内容
 * @param {string} filename - ダウンロードファイル名
 * @param {string} mimeType - MIMEタイプ（例: 'application/json', 'text/csv'）
 * @returns {void}
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
