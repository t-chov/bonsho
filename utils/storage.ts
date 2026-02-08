import { browser } from "wxt/browser";
import type { BonshoSettings, UsageRecord } from "./types";
import {
  DEFAULT_SETTINGS,
  STORAGE_KEY_SETTINGS,
  STORAGE_KEY_USAGE,
} from "./constants";

export async function getSettings(): Promise<BonshoSettings> {
  const result = await browser.storage.local.get(STORAGE_KEY_SETTINGS);
  return (result[STORAGE_KEY_SETTINGS] as BonshoSettings | undefined) ?? { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: BonshoSettings): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY_SETTINGS]: settings });
}

export async function getUsage(): Promise<UsageRecord> {
  const result = await browser.storage.local.get(STORAGE_KEY_USAGE);
  return (result[STORAGE_KEY_USAGE] as UsageRecord | undefined) ?? ({} as UsageRecord);
}

export async function addUsage(
  site: string,
  seconds: number,
): Promise<void> {
  const usage = await getUsage();
  const today = new Date().toISOString().slice(0, 10);
  const key = `${today}|${site}`;
  usage[key] = (usage[key] ?? 0) + seconds;
  await browser.storage.local.set({ [STORAGE_KEY_USAGE]: usage });
}
