import type { BonshoMessage, TargetSite } from "@/utils/types";
import { HEARTBEAT_INTERVAL_MS, TARGET_SITES } from "@/utils/constants";

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
    function detectSite(): TargetSite | null {
      const hostname = location.hostname;
      for (const site of TARGET_SITES) {
        if (hostname.includes(site)) return site;
      }
      return null;
    }

    const currentSite = detectSite();

    if (currentSite) {
      setInterval(() => {
        browser.runtime.sendMessage({
          type: "HEARTBEAT",
          site: currentSite,
        } as BonshoMessage);
      }, HEARTBEAT_INTERVAL_MS);
    }

    function showOverlay(): void {
      if (document.getElementById("bonsho-overlay")) return;

      const overlay = document.createElement("div");
      overlay.id = "bonsho-overlay";
      overlay.style.cssText = [
        "position: fixed",
        "inset: 0",
        "z-index: 2147483647",
        "display: flex",
        "flex-direction: column",
        "align-items: center",
        "justify-content: center",
        "background: rgba(15, 15, 20, 0.95)",
        "color: #e8d5b7",
        "font-family: 'Georgia', 'Times New Roman', serif",
        "backdrop-filter: blur(8px)",
      ].join(";");

      const bell = document.createElement("div");
      bell.textContent = "\u{1F514}";
      bell.style.cssText = "font-size: 64px; margin-bottom: 24px;";

      const heading = document.createElement("h1");
      heading.textContent = "A moment of pause";
      heading.style.cssText = [
        "font-size: 32px",
        "font-weight: 400",
        "margin: 0 0 12px",
        "color: #c9a84c",
      ].join(";");

      const message = document.createElement("p");
      message.textContent =
        "You have been scrolling for a while. Is this how you want to spend your time?";
      message.style.cssText = [
        "font-size: 18px",
        "max-width: 480px",
        "text-align: center",
        "line-height: 1.6",
        "margin: 0 0 32px",
        "opacity: 0.85",
      ].join(";");

      const button = document.createElement("button");
      button.textContent = "I understand";
      button.style.cssText = [
        "background: transparent",
        "border: 1px solid #c9a84c",
        "color: #c9a84c",
        "padding: 12px 32px",
        "font-size: 16px",
        "font-family: inherit",
        "cursor: pointer",
        "border-radius: 4px",
        "transition: background 0.2s",
      ].join(";");
      button.addEventListener("mouseenter", () => {
        button.style.background = "rgba(201, 168, 76, 0.15)";
      });
      button.addEventListener("mouseleave", () => {
        button.style.background = "transparent";
      });
      button.addEventListener("click", () => {
        overlay.remove();
      });

      overlay.append(bell, heading, message, button);
      document.body.appendChild(overlay);
    }

    browser.runtime.onMessage.addListener((message: BonshoMessage) => {
      if (message.type === "SHOW_WARNING") {
        showOverlay();
      }
    });
  },
});
