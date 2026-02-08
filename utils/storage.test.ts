import { describe, expect, it } from 'vitest';
import { normalizeSettings } from './storage';

describe('normalizeSettings', () => {
  it('fills missing settings with defaults', () => {
    const normalized = normalizeSettings({
      enabled: false,
      intervalMinutes: 10,
    });

    expect(normalized.enabled).toBe(false);
    expect(normalized.intervalMinutes).toBe(10);
    expect(normalized.dailyLimitMinutes).toBe(120);
    expect(normalized.activeSites.length).toBeGreaterThan(0);
  });

  it('uses defaults when settings are undefined', () => {
    const normalized = normalizeSettings(undefined);
    expect(normalized.enabled).toBe(true);
    expect(normalized.intervalMinutes).toBe(5);
    expect(normalized.dailyLimitMinutes).toBe(120);
    expect(normalized.activeSites.length).toBeGreaterThan(0);
  });
});
