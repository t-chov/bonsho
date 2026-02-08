import { useState, useEffect } from 'react';
import type { BonshoSettings, TargetSite, UsageRecord } from '@/utils/types';
import { TARGET_SITES } from '@/utils/constants';
import { getSettings, saveSettings, getUsage } from '@/utils/storage';
import { usageToJSON, usageToCSV, downloadFile } from '@/utils/export';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function App() {
  const [settings, setSettings] = useState<BonshoSettings | null>(null);
  const [usage, setUsage] = useState<UsageRecord>({});

  useEffect(() => {
    (async () => {
      const [s, u] = await Promise.all([getSettings(), getUsage()]);
      setSettings(s);
      setUsage(u);
    })();
  }, []);

  if (!settings) return null;

  const today = new Date().toISOString().slice(0, 10);
  let totalToday = 0;
  const siteUsageToday: Record<string, number> = {};

  for (const [key, seconds] of Object.entries(usage)) {
    const [date, site] = key.split('|');
    if (date === today) {
      totalToday += seconds;
      siteUsageToday[site] = (siteUsageToday[site] ?? 0) + seconds;
    }
  }

  const handleToggleEnabled = async (enabled: boolean) => {
    const updated = { ...settings, enabled };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleIntervalChange = async (minutes: number) => {
    if (minutes < 1 || minutes > 120) return;
    const updated = { ...settings, intervalMinutes: minutes };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleSiteToggle = async (site: TargetSite, active: boolean) => {
    let activeSites: TargetSite[];
    if (active && !settings.activeSites.includes(site)) {
      activeSites = [...settings.activeSites, site];
    } else if (!active) {
      activeSites = settings.activeSites.filter((s) => s !== site);
    } else {
      return;
    }
    const updated = { ...settings, activeSites };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleExportJSON = async () => {
    const allUsage = await getUsage();
    downloadFile(usageToJSON(allUsage), 'bonsho-usage.json', 'application/json');
  };

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
        <div className="setting-row">
          <label>Enabled</label>
          <input
            type="checkbox"
            className="toggle"
            checked={settings.enabled}
            onChange={(e) => handleToggleEnabled(e.target.checked)}
          />
        </div>
        <div className="setting-row">
          <label>Remind every</label>
          <div>
            <input
              type="number"
              min={1}
              max={120}
              value={settings.intervalMinutes}
              onChange={(e) => handleIntervalChange(parseInt(e.target.value, 10))}
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
                onChange={(e) => handleSiteToggle(site, e.target.checked)}
              />
              {' '}{site}
            </label>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-title">Export Data</div>
        <div className="export-buttons">
          <button onClick={handleExportJSON}>JSON</button>
          <button onClick={handleExportCSV}>CSV</button>
        </div>
      </div>
    </>
  );
}

export default App;
