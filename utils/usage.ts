import type { TargetSite, UsageRecord } from './types';

/**
 * 日付をローカルタイムゾーン基準のYYYY-MM-DD文字列に変換
 * @param {Date} date - 変換対象の日付
 * @returns {string} ローカル日付キー
 */
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 現在日時のローカル日付キーを取得
 * @returns {string} ローカル日付キー
 */
export function getTodayLocalDateKey(): string {
  return toLocalDateKey(new Date());
}

/**
 * 使用時間データから指定日・指定サイトの合計秒数を集計
 * @param {UsageRecord} usage - 使用時間レコード
 * @param {string} dateKey - 対象日（YYYY-MM-DD）
 * @param {TargetSite[]} sites - 集計対象サイト
 * @returns {number} 合計秒数
 */
export function sumUsageSecondsForDateAndSites(
  usage: UsageRecord,
  dateKey: string,
  sites: TargetSite[],
): number {
  let total = 0;
  for (const site of sites) {
    total += usage[`${dateKey}|${site}`] ?? 0;
  }
  return total;
}
