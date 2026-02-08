import type { BonshoSettings, TargetSite } from "./types";

export const TARGET_SITES: TargetSite[] = [
  "youtube.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "reddit.com",
];

export const DEFAULT_SETTINGS: BonshoSettings = {
  enabled: true,
  intervalMinutes: 5,
  activeSites: [...TARGET_SITES],
};

export const ALARM_NAME = "bonsho-reminder";

export const HEARTBEAT_INTERVAL_MS = 10_000;

export const STORAGE_KEY_SETTINGS = "settings";
export const STORAGE_KEY_USAGE = "usage";
