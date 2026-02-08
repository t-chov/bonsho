import { browser } from 'wxt/browser';
import { DEFAULT_SETTINGS, STORAGE_KEY_SETTINGS, STORAGE_KEY_USAGE } from './constants';
import type { BonshoSettings, UsageRecord } from './types';
import { getTodayLocalDateKey, isSettingsLockedForToday } from './usage';

export const SETTINGS_LOCKED_BY_DAILY_LIMIT = 'SETTINGS_LOCKED_BY_DAILY_LIMIT';

/**
 * 当日ロックによる設定更新拒否エラーか判定
 * @param {unknown} error - 判定対象エラー
 * @returns {boolean} ロックエラーなら true
 */
export function isSettingsLockedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message === SETTINGS_LOCKED_BY_DAILY_LIMIT;
}

/**
 * デフォルト値を使って設定オブジェクトを正規化
 * @param {Partial<BonshoSettings> | undefined} settings - 保存済み設定
 * @returns {BonshoSettings} 正規化された設定
 */
export function normalizeSettings(settings?: Partial<BonshoSettings>): BonshoSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    activeSites: settings?.activeSites ?? [...DEFAULT_SETTINGS.activeSites],
  };
}

/**
 * ローカルストレージから設定を取得
 * 設定が存在しない場合はデフォルト設定を返す
 * @returns {Promise<BonshoSettings>} 設定オブジェクト
 */
export async function getSettings(): Promise<BonshoSettings> {
  const result = await browser.storage.local.get(STORAGE_KEY_SETTINGS);
  return normalizeSettings(result[STORAGE_KEY_SETTINGS] as Partial<BonshoSettings> | undefined);
}

/**
 * ローカルストレージに設定を保存
 * @param {BonshoSettings} settings - 保存する設定オブジェクト
 * @returns {Promise<void>}
 */
export async function saveSettings(settings: BonshoSettings): Promise<void> {
  const [currentSettings, usage] = await Promise.all([getSettings(), getUsage()]);
  if (isSettingsLockedForToday(currentSettings, usage)) {
    throw new Error(SETTINGS_LOCKED_BY_DAILY_LIMIT);
  }
  await browser.storage.local.set({ [STORAGE_KEY_SETTINGS]: settings });
}

/**
 * ローカルストレージから使用時間記録を取得
 * @returns {Promise<UsageRecord>} 使用時間記録オブジェクト
 */
export async function getUsage(): Promise<UsageRecord> {
  const result = await browser.storage.local.get(STORAGE_KEY_USAGE);
  return (result[STORAGE_KEY_USAGE] as UsageRecord | undefined) ?? ({} as UsageRecord);
}

/**
 * 本日分の利用上限到達によって設定がロックされているか判定
 * @returns {Promise<boolean>} ロック状態
 */
export async function isSettingsLockedToday(): Promise<boolean> {
  const [settings, usage] = await Promise.all([getSettings(), getUsage()]);
  return isSettingsLockedForToday(settings, usage);
}

/**
 * 指定サイトの使用時間を加算して保存
 * 本日の日付とサイトをキーとして使用時間を記録する
 * @param {string} site - サイトドメイン
 * @param {number} seconds - 加算する秒数
 * @returns {Promise<void>}
 */
export async function addUsage(site: string, seconds: number): Promise<void> {
  const usage = await getUsage();
  const today = getTodayLocalDateKey();
  const key = `${today}|${site}`;
  usage[key] = (usage[key] ?? 0) + seconds;
  await browser.storage.local.set({ [STORAGE_KEY_USAGE]: usage });
}
