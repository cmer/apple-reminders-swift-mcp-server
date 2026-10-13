import { describe, expect, it } from 'vitest';
import { formatRecurrenceSummary } from '../../src/tools/recurrence-summary.js';

describe('formatRecurrenceSummary', () => {
  it.each([
    [{ frequency: 'daily', interval: 1 }, 'Every day'],
    [{ frequency: 'daily', interval: 3 }, 'Every 3 days'],
    [{ frequency: 'weekly', interval: 1 }, 'Every week'],
    [{ frequency: 'weekly', interval: 2 }, 'Every 2 weeks'],
    [{ frequency: 'weekly', interval: 1, daysOfWeek: ['monday', 'wednesday'] }, 'Every week on Mon, Wed'],
    [{ frequency: 'weekly', interval: 2, daysOfWeek: ['monday'] }, 'Every 2 weeks on Mon'],
    [{ frequency: 'monthly', interval: 1 }, 'Every month'],
    [{ frequency: 'yearly', interval: 2 }, 'Every 2 years'],
  ] as const)('%j -> %s', (rule, summary) => {
    expect(formatRecurrenceSummary(rule)).toBe(summary);
  });

  it('orders weekdays Sunday first, whatever order they come in', () => {
    expect(
      formatRecurrenceSummary({
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: ['saturday', 'monday', 'sunday', 'friday', 'tuesday', 'thursday', 'wednesday'],
      })
    ).toBe('Every week on Sun, Mon, Tue, Wed, Thu, Fri, Sat');
  });

  it('drops duplicate weekdays', () => {
    expect(
      formatRecurrenceSummary({ frequency: 'weekly', interval: 1, daysOfWeek: ['friday', 'friday'] })
    ).toBe('Every week on Fri');
  });

  it('treats a missing interval as 1', () => {
    expect(formatRecurrenceSummary({ frequency: 'daily' } as never)).toBe('Every day');
  });
});
