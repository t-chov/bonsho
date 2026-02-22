import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'bonsho',
    version: '0.3.2',
    description: 'Mindful screen time reminders',
    permissions: ['storage', 'notifications'],
    host_permissions: [
      '*://*.youtube.com/*',
      '*://*.twitter.com/*',
      '*://*.x.com/*',
      '*://*.facebook.com/*',
      '*://*.instagram.com/*',
      '*://*.tiktok.com/*',
      '*://*.reddit.com/*',
    ],
    icons: { 16: '/icon/16.png', 48: '/icon/48.png', 128: '/icon/128.png' },
  },
});
