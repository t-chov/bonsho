import type { BonshoSettings, TargetSite } from './types';

/**
 * 監視対象となるSNS・動画サイトのドメインリスト
 * @type {TargetSite[]}
 */
export const TARGET_SITES: TargetSite[] = [
  'youtube.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'reddit.com',
];

/**
 * デフォルト設定値
 * 初回インストール時や設定が存在しない場合に使用される
 * @type {BonshoSettings}
 */
export const DEFAULT_SETTINGS: BonshoSettings = {
  enabled: true,
  intervalMinutes: 5,
  dailyLimitMinutes: 120,
  activeSites: [...TARGET_SITES],
};

/**
 * リマインダーアラームの識別名
 * @type {string}
 */
export const ALARM_NAME = 'bonsho-reminder';

/**
 * 開発モードで時間経過を加速する倍率
 * `pnpm dev` 経由の起動時のみ 10 倍
 * @type {number}
 */
export const DEV_TIME_MULTIPLIER = import.meta.env.DEV ? 10 : 1;

/**
 * ハートビート送信間隔（ミリ秒）
 * Content Scriptが10秒ごとにBackgroundへ使用状況を通知
 * @type {number}
 */
export const HEARTBEAT_INTERVAL_MS = 10_000 / DEV_TIME_MULTIPLIER;

/**
 * ストレージキー: 設定データ
 * @type {string}
 */
export const STORAGE_KEY_SETTINGS = 'settings';

/**
 * ストレージキー: 使用時間データ
 * @type {string}
 */
export const STORAGE_KEY_USAGE = 'usage';

/**
 * ストレージキー: 前回リマインダー発火時の累計使用秒数
 * @type {string}
 */
export const STORAGE_KEY_LAST_REMINDER = 'lastReminderUsage';
