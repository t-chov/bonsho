/**
 * 監視対象サイトのドメイン型定義
 * @type {string}
 */
export type TargetSite =
  | 'youtube.com'
  | 'twitter.com'
  | 'x.com'
  | 'facebook.com'
  | 'instagram.com'
  | 'tiktok.com'
  | 'reddit.com';

/**
 * 使用時間記録のデータ構造
 * キー形式: "YYYY-MM-DD|site" -> 秒数
 * @interface
 */
export interface UsageRecord {
  /** Key format: "YYYY-MM-DD|site" -> seconds */
  [key: string]: number;
}

/**
 * Bonsho拡張機能の設定オブジェクト
 * @interface
 */
export interface BonshoSettings {
  /** 機能の有効/無効 */
  enabled: boolean;
  /** リマインダー表示間隔（分） */
  intervalMinutes: number;
  /** 1日の総利用時間上限（分） */
  dailyLimitMinutes: number;
  /** 監視対象サイトのリスト */
  activeSites: TargetSite[];
}

/**
 * メッセージタイプの型定義
 * @type {string}
 */
export type BonshoMessageType = 'HEARTBEAT' | 'SHOW_WARNING' | 'SHOW_HARD_LIMIT';

/**
 * ハートビートメッセージの構造
 * Content Script から Background へ定期的に送信される
 * @interface
 */
export interface HeartbeatMessage {
  type: 'HEARTBEAT';
  site: TargetSite;
}

/**
 * 警告表示メッセージの構造
 * Background から Content Script へ送信される
 * @interface
 */
export interface ShowWarningMessage {
  type: 'SHOW_WARNING';
}

/**
 * 日次利用上限超過時のロック表示メッセージ
 * Background から Content Script へ送信される
 * @interface
 */
export interface ShowHardLimitMessage {
  type: 'SHOW_HARD_LIMIT';
}

/**
 * Bonsho拡張機能内で使用される全メッセージの型
 * @type {HeartbeatMessage | ShowWarningMessage | ShowHardLimitMessage}
 */
export type BonshoMessage = HeartbeatMessage | ShowWarningMessage | ShowHardLimitMessage;
