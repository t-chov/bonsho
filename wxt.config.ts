import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'bonsho',
    version: '0.2.0',
    description: 'Mindful screen time reminders',
    permissions: ['alarms', 'storage', 'tabs', 'activeTab', 'notifications'],
    icons: { 16: '/icon/16.png', 48: '/icon/48.png', 128: '/icon/128.png' },
  },
});
