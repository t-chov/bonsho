import type { BonshoMessage, TargetSite } from "@/utils/types";
import { ALARM_NAME } from "@/utils/constants";
import { addUsage, getSettings } from "@/utils/storage";

export default defineBackground(() => {
  function matchesSite(url: string, sites: TargetSite[]): TargetSite | null {
    for (const site of sites) {
      if (url.includes(site)) return site;
    }
    return null;
  }

  async function setupAlarm(): Promise<void> {
    const settings = await getSettings();
    await browser.alarms.clear(ALARM_NAME);
    if (settings.enabled) {
      browser.alarms.create(ALARM_NAME, {
        periodInMinutes: settings.intervalMinutes,
      });
    }
  }

  browser.runtime.onInstalled.addListener(() => {
    setupAlarm();
  });

  browser.runtime.onStartup.addListener(() => {
    setupAlarm();
  });

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== ALARM_NAME) return;

    const settings = await getSettings();
    if (!settings.enabled) return;

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) return;

    const site = matchesSite(tab.url, settings.activeSites);
    if (!site) return;

    browser.tabs.sendMessage(tab.id, { type: "SHOW_WARNING" } as BonshoMessage);

    browser.notifications.create({
      type: "basic",
      iconUrl: browser.runtime.getURL("/icon/128.png"),
      title: "bonsho",
      message: `You've been on ${site} for a while. Take a mindful pause.`,
    });
  });

  browser.runtime.onMessage.addListener((message: BonshoMessage, _sender) => {
    if (message.type === "HEARTBEAT") {
      addUsage(message.site, 10);
    }
  });

  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes["settings"]) {
      setupAlarm();
    }
  });
});
