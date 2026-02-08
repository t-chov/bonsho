import { describe, expect, it } from 'vitest';
import { formatStopwatchTime, shouldCountStopwatch } from './stopwatch';

describe('formatStopwatchTime', () => {
  it('formats zero seconds as mm:ss', () => {
    expect(formatStopwatchTime(0)).toBe('00:00');
  });

  it('formats values under one hour as mm:ss', () => {
    expect(formatStopwatchTime(65)).toBe('01:05');
  });

  it('formats values over one hour as hh:mm:ss', () => {
    expect(formatStopwatchTime(3661)).toBe('01:01:01');
  });
});

describe('shouldCountStopwatch', () => {
  it('returns true only when visible and focused', () => {
    expect(shouldCountStopwatch('visible', true)).toBe(true);
    expect(shouldCountStopwatch('hidden', true)).toBe(false);
    expect(shouldCountStopwatch('visible', false)).toBe(false);
  });
});
