import { TARGET_SITES } from '@/utils/constants';
import { downloadFile, usageToCSV, usageToJSON } from '@/utils/export';
import {
  getSettings,
  getUsage,
  isSettingsLockedError,
  saveSettings,
} from '@/utils/storage';
import type { BonshoSettings, TargetSite, UsageRecord } from '@/utils/types';
import { getTodayLocalDateKey, isSettingsLockedForToday } from '@/utils/usage';
import { useEffect, useState } from 'react';

/**
 * 秒数を時間と分の読みやすい形式に変換
 * @param {number} seconds - 変換する秒数
 * @returns {string} フォーマット済みの時間文字列（例: "2h 30m", "45m"）
 */
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/**
 * Bonsho拡張機能のポップアップUIコンポーネント
 * 本日の使用時間表示、設定変更、データエクスポート機能を提供
 * @returns {JSX.Element | null} レンダリングされるポップアップUI
 */
function App() {
  const [settings, setSettings] = useState<BonshoSettings | null>(null);
  const [usage, setUsage] = useState<UsageRecord>({});
  const [isLockedToday, setIsLockedToday] = useState(false);

  async function loadPopupData(): Promise<void> {
    const [s, u] = await Promise.all([getSettings(), getUsage()]);
    setSettings(s);
    setUsage(u);
    setIsLockedToday(isSettingsLockedForToday(s, u));
  }

  async function saveSettingsWithRollback(updated: BonshoSettings): Promise<void> {
    setSettings(updated);
    try {
      await saveSettings(updated);
    } catch (error) {
      if (isSettingsLockedError(error)) {
        await loadPopupData();
        return;
      }
      throw error;
    }
  }

  useEffect(() => {
    void loadPopupData();
  }, []);

  if (!settings) return null;

  const today = getTodayLocalDateKey();
  let totalToday = 0;
  const siteUsageToday: Record<string, number> = {};

  for (const [key, seconds] of Object.entries(usage)) {
    const [date, site] = key.split('|');
    if (date === today) {
      totalToday += seconds;
      siteUsageToday[site] = (siteUsageToday[site] ?? 0) + seconds;
    }
  }

  /**
   * 機能の有効/無効を切り替え
   * @param {boolean} enabled - 有効化フラグ
   * @returns {Promise<void>}
   */
  const handleToggleEnabled = async (enabled: boolean) => {
    if (isLockedToday) return;
    const updated = { ...settings, enabled };
    await saveSettingsWithRollback(updated);
  };

  /**
   * リマインダー間隔を変更
   * @param {number} minutes - 新しい間隔（分）
   * @returns {Promise<void>}
   */
  const handleIntervalChange = async (minutes: number) => {
    if (isLockedToday) return;
    if (minutes < 1 || minutes > 120) return;
    const updated = { ...settings, intervalMinutes: minutes };
    await saveSettingsWithRollback(updated);
  };

  /**
   * 1日の総利用時間上限を変更
   * @param {number} minutes - 新しい上限（分）
   * @returns {Promise<void>}
   */
  const handleDailyLimitChange = async (minutes: number) => {
    if (isLockedToday) return;
    if (minutes < 1 || minutes > 1440) return;
    const updated = { ...settings, dailyLimitMinutes: minutes };
    await saveSettingsWithRollback(updated);
  };

  /**
   * 監視対象サイトの有効/無効を切り替え
   * @param {TargetSite} site - 対象サイト
   * @param {boolean} active - 有効化フラグ
   * @returns {Promise<void>}
   */
  const handleSiteToggle = async (site: TargetSite, active: boolean) => {
    if (isLockedToday) return;
    let activeSites: TargetSite[];
    if (active && !settings.activeSites.includes(site)) {
      activeSites = [...settings.activeSites, site];
    } else if (!active) {
      activeSites = settings.activeSites.filter((s) => s !== site);
    } else {
      return;
    }
    const updated = { ...settings, activeSites };
    await saveSettingsWithRollback(updated);
  };

  /**
   * 使用時間データをJSON形式でエクスポート
   * @returns {Promise<void>}
   */
  const handleExportJSON = async () => {
    const allUsage = await getUsage();
    downloadFile(usageToJSON(allUsage), 'bonsho-usage.json', 'application/json');
  };

  /**
   * 使用時間データをCSV形式でエクスポート
   * @returns {Promise<void>}
   */
  const handleExportCSV = async () => {
    const allUsage = await getUsage();
    downloadFile(usageToCSV(allUsage), 'bonsho-usage.csv', 'text/csv');
  };

  return (
    <>
      <h1>{'\u{1F514}'} bonsho</h1>

      <div className="section">
        <div className="section-title">Today's Usage</div>
        <div className="usage-total">{formatTime(totalToday)}</div>
        <div className="usage-label">across monitored sites</div>
        <div className="site-usage">
          {TARGET_SITES.filter((site) => (siteUsageToday[site] ?? 0) > 0).map((site) => (
            <div key={site} className="site-usage-row">
              <span className="site-name">{site}</span>
              <span>{formatTime(siteUsageToday[site])}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-title">Settings</div>
        {isLockedToday && (
          <p className="settings-locked-message">
            You reached today's limit. Settings are locked until tomorrow.
          </p>
        )}
        <div className="setting-row">
          <label htmlFor="enabled-toggle">Enabled</label>
          <input
            id="enabled-toggle"
            type="checkbox"
            className="toggle"
            checked={settings.enabled}
            disabled={isLockedToday}
            onChange={(e) => handleToggleEnabled(e.target.checked)}
          />
        </div>
        <div className="setting-row">
          <label htmlFor="interval-input">Remind every</label>
          <div>
            <input
              id="interval-input"
              type="number"
              min={1}
              max={120}
              value={settings.intervalMinutes}
              disabled={isLockedToday}
              onChange={(e) => handleIntervalChange(Number.parseInt(e.target.value, 10))}
            />{' '}
            min
          </div>
        </div>
        <div className="setting-row">
          <label htmlFor="daily-limit-input">Daily limit</label>
          <div>
            <input
              id="daily-limit-input"
              type="number"
              min={1}
              max={1440}
              value={settings.dailyLimitMinutes}
              disabled={isLockedToday}
              onChange={(e) => handleDailyLimitChange(Number.parseInt(e.target.value, 10))}
            />{' '}
            min
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Monitored Sites</div>
        <div className="sites-grid">
          {TARGET_SITES.map((site) => (
            <label key={site}>
              <input
                type="checkbox"
                checked={settings.activeSites.includes(site)}
                disabled={isLockedToday}
                onChange={(e) => handleSiteToggle(site, e.target.checked)}
              />{' '}
              {site}
            </label>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-title">Export Data</div>
        <div className="export-buttons">
          <button type="button" onClick={handleExportJSON}>
            JSON
          </button>
          <button type="button" onClick={handleExportCSV}>
            CSV
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
