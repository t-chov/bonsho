import {
  addUsage,
  getLastReminderUsage,
  getSettings,
  getUsage,
  saveLastReminderUsage,
} from '@/utils/storage';
import type { BonshoMessage, TargetSite } from '@/utils/types';
import { checkReminderDue, getTodayLocalDateKey, isDailyLimitReached } from '@/utils/usage';

/**
 * Background Service Worker のエントリーポイント
 * ハートビート受信、使用時間記録、ハートビートベースのリマインダー判定を担当
 */
export default defineBackground(() => {
  /**
   * URLが指定サイトリストのいずれかを含むかチェック
   * @param {string} url - チェック対象のURL
   * @param {TargetSite[]} sites - 監視対象サイトリスト
   * @returns {TargetSite | null} マッチしたサイト、またはnull
   */
  function matchesSite(url: string, sites: TargetSite[]): TargetSite | null {
    for (const site of sites) {
      if (url.includes(site)) return site;
    }
    return null;
  }

  /**
   * Content Scriptからのメッセージ受信処理
   * HEARTBEATメッセージを受信し、使用時間を記録し、リマインダーを判定する
   */
  browser.runtime.onMessage.addListener((message: BonshoMessage, sender) => {
    if (message.type === 'HEARTBEAT') {
      void (async () => {
        const settings = await getSettings();
        if (!settings.enabled) return;
        if (!settings.activeSites.includes(message.site)) return;

        await addUsage(message.site, 10);

        const tab = sender.tab;
        if (!tab?.id || !tab.url) return;

        const site = matchesSite(tab.url, settings.activeSites);
        if (!site) return;

        const usage = await getUsage();

        // 日次利用上限チェック
        if (isDailyLimitReached(settings, usage)) {
          browser.tabs.sendMessage(tab.id, { type: 'SHOW_HARD_LIMIT' } as BonshoMessage);
          return;
        }

        // ハートビートベースのリマインダー判定
        const today = getTodayLocalDateKey();
        const siteKey = `${today}|${site}`;
        const currentSiteUsage = usage[siteKey] ?? 0;

        const lastReminderData = await getLastReminderUsage();
        const result = checkReminderDue(
          currentSiteUsage,
          lastReminderData[siteKey],
          settings.intervalMinutes,
        );

        lastReminderData[siteKey] = result.newBaseline;
        await saveLastReminderUsage(lastReminderData);

        if (result.shouldRemind) {
          browser.tabs.sendMessage(tab.id, { type: 'SHOW_WARNING' } as BonshoMessage);
          browser.notifications.create({
            type: 'basic',
            iconUrl: browser.runtime.getURL('/icon/128.png'),
            title: 'bonsho',
            message: `You've been on ${site} for a while. Take a mindful pause.`,
          });
        }
      })();
    }
  });
});
