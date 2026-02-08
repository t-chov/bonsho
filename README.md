# bonsho

[![CI](https://github.com/t-chov/bonsho/actions/workflows/ci.yml/badge.svg)](https://github.com/t-chov/bonsho/actions/workflows/ci.yml)

_Mindful screen time reminders for social media and video sites._

A zen-inspired Chrome extension designed to help you maintain a healthy relationship with social media and video streaming platforms. It provides periodic reminders and usage statistics to encourage mindful consumption.

## Features

- **Mindful Reminders**: Periodic "Moment of Pause" overlays and notifications to break the doom-scrolling cycle.
- **Usage Tracking**: Automatically tracks time spent on supported platforms.
- **Mini Stopwatch**: Shows elapsed time on monitored pages in the bottom-right/left corner, and can be hidden when it overlaps page UI.
- **Usage Dashboard**: View your daily usage statistics directly in the extension popup.
- **Data Export**: Export your usage data in JSON or CSV format for your own analysis.
- **Privacy Focused**: All data is stored locally in your browser. No data is sent to external servers.
- **Customizable**:
    - Adjust reminder intervals (1-120 minutes).
    - Toggle specific sites to monitor.
    - Enable/disable the extension globally.

## Supported Sites

- YouTube (`youtube.com`)
- Twitter (`twitter.com`)
- X (`x.com`)
- Facebook (`facebook.com`)
- Instagram (`instagram.com`)
- TikTok (`tiktok.com`)
- Reddit (`reddit.com`)

## Installation (Users)

1. Open the [Releases](https://github.com/t-chov/bonsho/releases) page.
2. Download the archive for your browser:
   - Chromium browsers: `bonsho-<version>-chrome.zip`
   - Firefox: `bonsho-<version>-firefox.zip`

### Chromium (Chrome / Edge / Brave)

1. Unzip `bonsho-<version>-chrome.zip`.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the extracted folder.

### Firefox

1. Unzip `bonsho-<version>-firefox.zip`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...** and select `manifest.json` in the extracted folder.

## Installation (Development)

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    pnpm install
    ```
3.  **Start Development Server**:
    ```bash
    pnpm dev
    ```
    This will open a new Chrome instance with the extension loaded.

## Build

To build the extension for production:

```bash
pnpm build
```

The output will be in the `.output` directory.

## Tech Stack

- [WXT](https://wxt.dev/) - Web Extension Framework
- [React](https://react.dev/) - UI Library
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
