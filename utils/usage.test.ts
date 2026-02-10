import { describe, expect, it } from 'vitest';
import type { BonshoSettings, UsageRecord } from './types';
import {
  checkReminderDue,
  isDailyLimitReached,
  sumUsageSecondsForDateAndSites,
  toLocalDateKey,
} from './usage';

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

describe('checkReminderDue', () => {
  it('初回ハートビート（undefined baseline）ではベースラインを初期化しリマインドしない', () => {
    const result = checkReminderDue(30, undefined, 3);
    expect(result.shouldRemind).toBe(false);
    expect(result.newBaseline).toBe(30);
  });

  it('SW再起動後（undefined + 大きいcurrentUsage）でもベースラインを再初期化する', () => {
    const result = checkReminderDue(500, undefined, 3);
    expect(result.shouldRemind).toBe(false);
    expect(result.newBaseline).toBe(500);
  });

  it('閾値に達したらshouldRemind: trueを返す', () => {
    const result = checkReminderDue(180, 0, 3);
    expect(result.shouldRemind).toBe(true);
    expect(result.newBaseline).toBe(180);
  });

  it('閾値を超過してもshouldRemind: trueを返す', () => {
    const result = checkReminderDue(200, 0, 3);
    expect(result.shouldRemind).toBe(true);
    expect(result.newBaseline).toBe(200);
  });

  it('閾値未達ではshouldRemind: falseを返しベースラインを維持する', () => {
    const result = checkReminderDue(100, 0, 3);
    expect(result.shouldRemind).toBe(false);
    expect(result.newBaseline).toBe(0);
  });

  it('連続リマインダーは前回ベースラインからの差分で判定する', () => {
    // 1回目のリマインダー発火後、ベースラインが180になっている状態
    const result1 = checkReminderDue(350, 180, 3);
    expect(result1.shouldRemind).toBe(false);
    expect(result1.newBaseline).toBe(180);

    // 2回目の閾値に到達
    const result2 = checkReminderDue(360, 180, 3);
    expect(result2.shouldRemind).toBe(true);
    expect(result2.newBaseline).toBe(360);
  });
});
