import type { BonshoSettings, TargetSite, UsageRecord } from './types';

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

/**
 * 当日の利用時間が上限に到達しているか判定
 * @param {BonshoSettings} settings - 現在の設定
 * @param {UsageRecord} usage - 使用時間レコード
 * @returns {boolean} 上限到達時に true
 */
export function isDailyLimitReached(settings: BonshoSettings, usage: UsageRecord): boolean {
  const today = getTodayLocalDateKey();
  const todaySeconds = sumUsageSecondsForDateAndSites(usage, today, settings.activeSites);
  return todaySeconds >= settings.dailyLimitMinutes * 60;
}

/**
 * 当日中の設定変更ロック状態を判定
 * @param {BonshoSettings} settings - 現在の設定
 * @param {UsageRecord} usage - 使用時間レコード
 * @returns {boolean} 当日ロック中なら true
 */
export function isSettingsLockedForToday(settings: BonshoSettings, usage: UsageRecord): boolean {
  return isDailyLimitReached(settings, usage);
}

/**
 * リマインダー発火判定の結果
 * @interface
 */
export interface CheckReminderResult {
  /** リマインドを発火すべきか */
  shouldRemind: boolean;
  /** 次回判定用の新しいベースライン秒数 */
  newBaseline: number;
}

/**
 * 累計使用時間ベースでリマインダーを発火すべきか判定する
 * @param {number} currentUsage - 現在の累計使用秒数
 * @param {number | undefined} usageAtLastReminder - 前回リマインダー発火時の累計秒数（未設定時undefined）
 * @param {number} intervalMinutes - リマインダー間隔（分）
 * @returns {CheckReminderResult} 判定結果とベースライン
 */
export function checkReminderDue(
  currentUsage: number,
  usageAtLastReminder: number | undefined,
  intervalMinutes: number,
): CheckReminderResult {
  if (usageAtLastReminder === undefined) {
    return { shouldRemind: false, newBaseline: currentUsage };
  }
  const thresholdSeconds = intervalMinutes * 60;
  if (currentUsage - usageAtLastReminder >= thresholdSeconds) {
    return { shouldRemind: true, newBaseline: currentUsage };
  }
  return { shouldRemind: false, newBaseline: usageAtLastReminder };
}
