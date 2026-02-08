import { browser } from 'wxt/browser';
import { DEFAULT_SETTINGS, STORAGE_KEY_SETTINGS, STORAGE_KEY_USAGE } from './constants';
import type { BonshoSettings, UsageRecord } from './types';

/**
 * ローカルストレージから設定を取得
 * 設定が存在しない場合はデフォルト設定を返す
 * @returns {Promise<BonshoSettings>} 設定オブジェクト
 */
export async function getSettings(): Promise<BonshoSettings> {
  const result = await browser.storage.local.get(STORAGE_KEY_SETTINGS);
  return (result[STORAGE_KEY_SETTINGS] as BonshoSettings | undefined) ?? { ...DEFAULT_SETTINGS };
}

/**
 * ローカルストレージに設定を保存
 * @param {BonshoSettings} settings - 保存する設定オブジェクト
 * @returns {Promise<void>}
 */
export async function saveSettings(settings: BonshoSettings): Promise<void> {
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
 * 指定サイトの使用時間を加算して保存
 * 本日の日付とサイトをキーとして使用時間を記録する
 * @param {string} site - サイトドメイン
 * @param {number} seconds - 加算する秒数
 * @returns {Promise<void>}
 */
export async function addUsage(site: string, seconds: number): Promise<void> {
  const usage = await getUsage();
  const today = new Date().toISOString().slice(0, 10);
  const key = `${today}|${site}`;
  usage[key] = (usage[key] ?? 0) + seconds;
  await browser.storage.local.set({ [STORAGE_KEY_USAGE]: usage });
}
