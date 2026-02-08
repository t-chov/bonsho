import { beforeEach, describe, expect, it, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { STORAGE_KEY_SETTINGS, STORAGE_KEY_USAGE, TARGET_SITES } from './constants';
import { SETTINGS_LOCKED_BY_DAILY_LIMIT, isSettingsLockedToday, saveSettings } from './storage';
import type { BonshoSettings } from './types';
import { toLocalDateKey } from './usage';

vi.mock('wxt/browser', () => ({
  browser: {
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn(),
      },
    },
  },
}));

describe('settings lock guard', () => {
  const getMock = browser.storage.local.get as unknown as ReturnType<typeof vi.fn>;
  const setMock = browser.storage.local.set as unknown as ReturnType<typeof vi.fn>;

  const baseSettings: BonshoSettings = {
    enabled: true,
    intervalMinutes: 5,
    dailyLimitMinutes: 2,
    activeSites: [...TARGET_SITES],
  };

  beforeEach(() => {
    getMock.mockReset();
    setMock.mockReset();
  });

  it('blocks saveSettings when today usage reached daily limit', async () => {
    const today = toLocalDateKey(new Date());
    getMock
      .mockResolvedValueOnce({ [STORAGE_KEY_SETTINGS]: baseSettings })
      .mockResolvedValueOnce({ [STORAGE_KEY_USAGE]: { [`${today}|youtube.com`]: 120 } });

    await expect(saveSettings({ ...baseSettings, intervalMinutes: 10 })).rejects.toThrow(
      SETTINGS_LOCKED_BY_DAILY_LIMIT,
    );
    expect(setMock).not.toHaveBeenCalled();
  });

  it('allows saveSettings when below daily limit', async () => {
    const today = toLocalDateKey(new Date());
    getMock
      .mockResolvedValueOnce({ [STORAGE_KEY_SETTINGS]: baseSettings })
      .mockResolvedValueOnce({ [STORAGE_KEY_USAGE]: { [`${today}|youtube.com`]: 119 } });

    const updated = { ...baseSettings, intervalMinutes: 10 };
    await saveSettings(updated);

    expect(setMock).toHaveBeenCalledWith({ [STORAGE_KEY_SETTINGS]: updated });
  });

  it('reports lock status from current data', async () => {
    const today = toLocalDateKey(new Date());
    getMock
      .mockResolvedValueOnce({ [STORAGE_KEY_SETTINGS]: baseSettings })
      .mockResolvedValueOnce({ [STORAGE_KEY_USAGE]: { [`${today}|youtube.com`]: 120 } });

    await expect(isSettingsLockedToday()).resolves.toBe(true);
  });
});
