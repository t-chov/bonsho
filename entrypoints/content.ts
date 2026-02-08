import { HEARTBEAT_INTERVAL_MS, TARGET_SITES } from '@/utils/constants';
import { formatStopwatchTime, shouldCountStopwatch } from '@/utils/stopwatch';
import { getSettings } from '@/utils/storage';
import type { BonshoMessage, TargetSite } from '@/utils/types';
import './content_style.css';

/**
 * Content Script のエントリーポイント
 * 監視対象サイトでハートビート送信とオーバーレイ表示を担当
 */
export default defineContentScript({
  matches: [
    '*://*.youtube.com/*',
    '*://*.twitter.com/*',
    '*://*.x.com/*',
    '*://*.facebook.com/*',
    '*://*.instagram.com/*',
    '*://*.tiktok.com/*',
    '*://*.reddit.com/*',
  ],
  main() {
    /**
     * 現在のページが監視対象サイトかどうかを判定
     * @returns {TargetSite | null} 検出されたサイト、または null
     */
    function detectSite(): TargetSite | null {
      const hostname = location.hostname;
      for (const site of TARGET_SITES) {
        if (hostname.includes(site)) return site;
      }
      return null;
    }

    const currentSite = detectSite();

    /**
     * 監視対象サイトの場合、定期的にハートビートを送信
     */
    if (currentSite) {
      setInterval(() => {
        browser.runtime.sendMessage({
          type: 'HEARTBEAT',
          site: currentSite,
        } as BonshoMessage);
      }, HEARTBEAT_INTERVAL_MS);
    }

    /**
     * ページ滞在時間を表示するミニストップウォッチを作成
     * 右下/左下への移動とページ単位での非表示に対応
     * @returns {void}
     */
    function showStopwatchWidget(): void {
      if (document.getElementById('bonsho-stopwatch-widget')) return;

      const widget = document.createElement('div');
      widget.id = 'bonsho-stopwatch-widget';

      const elapsed = document.createElement('span');
      elapsed.className = 'bonsho-stopwatch-elapsed';
      elapsed.textContent = '00:00';

      const togglePositionButton = document.createElement('button');
      togglePositionButton.className = 'bonsho-stopwatch-control';
      togglePositionButton.type = 'button';
      togglePositionButton.textContent = '\u{21C6}';
      togglePositionButton.title = 'Move stopwatch';
      togglePositionButton.ariaLabel = 'Move stopwatch';

      const closeButton = document.createElement('button');
      closeButton.className = 'bonsho-stopwatch-control';
      closeButton.type = 'button';
      closeButton.textContent = '\u{00D7}';
      closeButton.title = 'Hide stopwatch';
      closeButton.ariaLabel = 'Hide stopwatch';

      let position: 'right' | 'left' = 'right';
      let elapsedSeconds = 0;

      const applyPosition = () => {
        if (position === 'right') {
          widget.style.right = '16px';
          widget.style.left = '';
        } else {
          widget.style.left = '16px';
          widget.style.right = '';
        }
      };

      const updateElapsedText = () => {
        elapsed.textContent = formatStopwatchTime(elapsedSeconds);
      };

      const timerId = window.setInterval(() => {
        if (!shouldCountStopwatch(document.visibilityState, document.hasFocus())) return;
        elapsedSeconds += 1;
        updateElapsedText();
      }, 1000);

      const cleanup = () => {
        window.clearInterval(timerId);
        window.removeEventListener('beforeunload', cleanup);
      };

      window.addEventListener('beforeunload', cleanup, { once: true });

      togglePositionButton.addEventListener('click', () => {
        position = position === 'right' ? 'left' : 'right';
        applyPosition();
      });

      closeButton.addEventListener('click', () => {
        cleanup();
        widget.remove();
      });

      updateElapsedText();
      widget.append(elapsed, togglePositionButton, closeButton);
      (document.body ?? document.documentElement).appendChild(widget);
    }

    /**
     * マインドフルネス促進オーバーレイを表示
     * 全画面の禅テーマオーバーレイを表示し、ユーザーに一時停止を促す
     * @returns {void}
     */
    function showOverlay(): void {
      if (document.getElementById('bonsho-overlay')) return;

      const overlay = document.createElement('div');
      overlay.id = 'bonsho-overlay';

      const bell = document.createElement('div');
      bell.className = 'bonsho-overlay-bell';
      bell.textContent = '\u{1F514}';

      const heading = document.createElement('h1');
      heading.className = 'bonsho-overlay-heading';
      heading.textContent = 'A moment of pause';

      const message = document.createElement('p');
      message.className = 'bonsho-overlay-message';
      message.textContent =
        'You have been scrolling for a while. Is this how you want to spend your time?';

      const button = document.createElement('button');
      button.className = 'bonsho-overlay-button';
      button.textContent = 'I understand';
      button.addEventListener('click', () => {
        overlay.remove();
      });

      overlay.append(bell, heading, message, button);
      document.body.appendChild(overlay);
    }

    /**
     * Background からのメッセージ受信処理
     * SHOW_WARNINGメッセージを受信し、オーバーレイを表示
     */
    browser.runtime.onMessage.addListener((message: BonshoMessage) => {
      if (message.type === 'SHOW_WARNING') {
        showOverlay();
      }
    });

    (async () => {
      if (!currentSite) return;
      const settings = await getSettings();
      if (!settings.enabled || !settings.activeSites.includes(currentSite)) return;
      showOverlay();
      showStopwatchWidget();
    })();
  },
});
