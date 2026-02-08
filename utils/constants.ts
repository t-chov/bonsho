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
  activeSites: [...TARGET_SITES],
};

/**
 * リマインダーアラームの識別名
 * @type {string}
 */
export const ALARM_NAME = 'bonsho-reminder';

/**
 * ハートビート送信間隔（ミリ秒）
 * Content Scriptが10秒ごとにBackgroundへ使用状況を通知
 * @type {number}
 */
export const HEARTBEAT_INTERVAL_MS = 10_000;

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
