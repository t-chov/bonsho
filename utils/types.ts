export type TargetSite =
  | "youtube.com"
  | "twitter.com"
  | "x.com"
  | "facebook.com"
  | "instagram.com"
  | "tiktok.com"
  | "reddit.com";

export interface UsageRecord {
  /** Key format: "YYYY-MM-DD|site" -> seconds */
  [key: string]: number;
}

export interface BonshoSettings {
  enabled: boolean;
  /** Reminder interval in minutes */
  intervalMinutes: number;
  /** Which sites to monitor */
  activeSites: TargetSite[];
}

export type BonshoMessageType = "HEARTBEAT" | "SHOW_WARNING";

export interface HeartbeatMessage {
  type: "HEARTBEAT";
  site: TargetSite;
}

export interface ShowWarningMessage {
  type: "SHOW_WARNING";
}

export type BonshoMessage = HeartbeatMessage | ShowWarningMessage;
