import { describe, expect, it } from 'vitest';
import { usageToCSV, usageToJSON } from './export';

describe('usageToJSON', () => {
  it('converts empty usage to empty array', () => {
    expect(usageToJSON({})).toBe('[]');
  });

  it('converts single entry', () => {
    const usage = { '2025-01-15|youtube.com': 120 };
    const result = JSON.parse(usageToJSON(usage));
    expect(result).toEqual([{ date: '2025-01-15', site: 'youtube.com', seconds: 120 }]);
  });

  it('converts multiple entries', () => {
    const usage = {
      '2025-01-15|youtube.com': 120,
      '2025-01-15|twitter.com': 60,
      '2025-01-16|youtube.com': 300,
    };
    const result = JSON.parse(usageToJSON(usage));
    expect(result).toHaveLength(3);
    expect(result).toContainEqual({
      date: '2025-01-15',
      site: 'youtube.com',
      seconds: 120,
    });
    expect(result).toContainEqual({
      date: '2025-01-15',
      site: 'twitter.com',
      seconds: 60,
    });
    expect(result).toContainEqual({
      date: '2025-01-16',
      site: 'youtube.com',
      seconds: 300,
    });
  });

  it('outputs pretty-printed JSON', () => {
    const usage = { '2025-01-15|youtube.com': 120 };
    const output = usageToJSON(usage);
    expect(output).toContain('\n');
    expect(output).toContain('  ');
  });
});

describe('usageToCSV', () => {
  it('returns header only for empty usage', () => {
    expect(usageToCSV({})).toBe('date,site,seconds');
  });

  it('converts single entry', () => {
    const usage = { '2025-01-15|youtube.com': 120 };
    const lines = usageToCSV(usage).split('\n');
    expect(lines).toEqual(['date,site,seconds', '2025-01-15,youtube.com,120']);
  });

  it('converts multiple entries', () => {
    const usage = {
      '2025-01-15|youtube.com': 120,
      '2025-01-15|twitter.com': 60,
    };
    const lines = usageToCSV(usage).split('\n');
    expect(lines[0]).toBe('date,site,seconds');
    expect(lines).toHaveLength(3);
    expect(lines).toContain('2025-01-15,youtube.com,120');
    expect(lines).toContain('2025-01-15,twitter.com,60');
  });
});
