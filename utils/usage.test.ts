import { describe, expect, it } from 'vitest';
import type { BonshoSettings, UsageRecord } from './types';
import { isDailyLimitReached, sumUsageSecondsForDateAndSites, toLocalDateKey } from './usage';

describe('toLocalDateKey', () => {
  it('formats local date as YYYY-MM-DD', () => {
    const date = new Date(2026, 1, 8, 12, 34, 56);
    expect(toLocalDateKey(date)).toBe('2026-02-08');
  });
});

describe('sumUsageSecondsForDateAndSites', () => {
  it('sums only target date and active sites', () => {
    const usage: UsageRecord = {
      '2026-02-08|youtube.com': 120,
      '2026-02-08|x.com': 60,
      '2026-02-08|reddit.com': 30,
      '2026-02-07|youtube.com': 1000,
    };

    const total = sumUsageSecondsForDateAndSites(usage, '2026-02-08', ['youtube.com', 'x.com']);
    expect(total).toBe(180);
  });

  it('returns 0 when there is no matching usage', () => {
    const usage: UsageRecord = {
      '2026-02-08|reddit.com': 30,
    };

    const total = sumUsageSecondsForDateAndSites(usage, '2026-02-08', ['youtube.com']);
    expect(total).toBe(0);
  });
});

describe('isDailyLimitReached', () => {
  const baseSettings: BonshoSettings = {
    enabled: true,
    intervalMinutes: 5,
    dailyLimitMinutes: 2,
    activeSites: ['youtube.com', 'x.com'],
  };

  it('returns false when total is below limit', () => {
    const usage: UsageRecord = {
      [`${toLocalDateKey(new Date())}|youtube.com`]: 119,
    };
    expect(isDailyLimitReached(baseSettings, usage)).toBe(false);
  });

  it('returns true when total reaches the limit', () => {
    const usage: UsageRecord = {
      [`${toLocalDateKey(new Date())}|youtube.com`]: 120,
    };
    expect(isDailyLimitReached(baseSettings, usage)).toBe(true);
  });

  it('ignores usage from non-active sites', () => {
    const usage: UsageRecord = {
      [`${toLocalDateKey(new Date())}|reddit.com`]: 1000,
    };
    expect(isDailyLimitReached(baseSettings, usage)).toBe(false);
  });
});
