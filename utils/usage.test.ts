import { describe, expect, it } from 'vitest';
import type { UsageRecord } from './types';
import { sumUsageSecondsForDateAndSites, toLocalDateKey } from './usage';

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
