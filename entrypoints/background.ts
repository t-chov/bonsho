import { ALARM_NAME, DEV_TIME_MULTIPLIER } from '@/utils/constants';
import { addUsage, getSettings, getUsage } from '@/utils/storage';
import type { BonshoMessage, TargetSite } from '@/utils/types';
import { isDailyLimitReached } from '@/utils/usage';

/**
 * Background Service Worker のエントリーポイント
 * ハートビート受信、使用時間記録、アラーム管理、警告通知を担当
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
   * リマインダーアラームの設定または解除
   * 設定が有効な場合はアラームを作成し、無効な場合は削除する
   * @returns {Promise<void>}
   */
  async function setupAlarm(): Promise<void> {
    const settings = await getSettings();
    await browser.alarms.clear(ALARM_NAME);
    if (settings.enabled) {
      const periodInMinutes = Math.max(settings.intervalMinutes / DEV_TIME_MULTIPLIER, 0.1);
      browser.alarms.create(ALARM_NAME, {
        periodInMinutes,
      });
    }
  }

  /**
   * 拡張機能インストール時にアラームを初期化
   */
  browser.runtime.onInstalled.addListener(() => {
    setupAlarm();
  });

  /**
   * ブラウザ起動時にアラームを再設定
   */
  browser.runtime.onStartup.addListener(() => {
    setupAlarm();
  });

  /**
   * アラーム発火時の処理
   * アクティブタブが監視対象サイトの場合、警告オーバーレイと通知を表示
   */
  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== ALARM_NAME) return;

    const settings = await getSettings();
    if (!settings.enabled) return;

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) return;

    const site = matchesSite(tab.url, settings.activeSites);
    if (!site) return;

    const usage = await getUsage();
    const isOverDailyLimit = isDailyLimitReached(settings, usage);

    browser.tabs.sendMessage(
      tab.id,
      { type: isOverDailyLimit ? 'SHOW_HARD_LIMIT' : 'SHOW_WARNING' } as BonshoMessage,
    );

    browser.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('/icon/128.png'),
      title: 'bonsho',
      message: `You've been on ${site} for a while. Take a mindful pause.`,
    });
  });

  /**
   * Content Scriptからのメッセージ受信処理
   * HEARTBEATメッセージを受信し、使用時間を記録
   */
  browser.runtime.onMessage.addListener((message: BonshoMessage, sender) => {
    if (message.type === 'HEARTBEAT') {
      void (async () => {
        const settings = await getSettings();
        if (!settings.enabled) return;
        if (!settings.activeSites.includes(message.site)) return;

        await addUsage(message.site, 10);

        const usage = await getUsage();
        const isOverDailyLimit = isDailyLimitReached(settings, usage);
        if (!isOverDailyLimit) return;

        const tab = sender.tab;
        if (!tab?.id || !tab.url) return;

        const site = matchesSite(tab.url, settings.activeSites);
        if (!site) return;

        browser.tabs.sendMessage(tab.id, { type: 'SHOW_HARD_LIMIT' } as BonshoMessage);
      })();
    }
  });

  /**
   * ストレージ変更の監視
   * 設定が変更された場合、アラームを再設定
   */
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.settings) {
      setupAlarm();
    }
  });
});
