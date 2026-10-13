import { describe, expect, it } from 'vitest';
import { createReminderSchema, recurrenceRuleSchema } from '../../src/validation/reminder-schemas.js';

function messages(input: unknown): string[] {
  const result = recurrenceRuleSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe('recurrenceRuleSchema', () => {
  it('accepts daily and weekly rules and defaults interval to 1', () => {
    expect(recurrenceRuleSchema.parse({ frequency: 'daily' })).toEqual({
      frequency: 'daily',
      interval: 1,
    });
    expect(
      recurrenceRuleSchema.parse({
        frequency: 'weekly',
        interval: 2,
        daysOfWeek: ['monday', 'wednesday'],
      })
    ).toEqual({ frequency: 'weekly', interval: 2, daysOfWeek: ['monday', 'wednesday'] });
  });

  it('rejects an interval below 1 or that is not a whole number', () => {
    for (const interval of [0, -1, 1.5]) {
      expect(messages({ frequency: 'daily', interval })).toEqual([
        'interval must be a whole number, 1 or greater',
      ]);
    }
  });

  it('accepts only full lowercase weekday names', () => {
    for (const day of ['mon', 'Monday', 'someday', 2]) {
      const [message] = messages({ frequency: 'weekly', daysOfWeek: [day] });
      expect(message).toBe(
        'daysOfWeek must use full lowercase weekday names: sunday, monday, tuesday, wednesday, thursday, friday, saturday'
      );
    }
  });

  it('rejects daysOfWeek on anything but weekly', () => {
    expect(messages({ frequency: 'daily', daysOfWeek: ['monday'] })).toEqual([
      'daysOfWeek only applies to weekly rules',
    ]);
    expect(messages({ frequency: 'monthly', daysOfWeek: ['monday'] })).toEqual([
      'daysOfWeek only applies to weekly rules',
    ]);
  });

  it('rejects an empty daysOfWeek', () => {
    expect(messages({ frequency: 'weekly', daysOfWeek: [] })).toEqual([
      "daysOfWeek can't be empty: omit it to repeat on the due date's weekday",
    ]);
  });

  it('rejects unknown frequencies and unrecognized fields', () => {
    expect(messages({ frequency: 'hourly' })).toHaveLength(1);
    expect(messages({ frequency: 'daily', daysOfMonth: [1] })[0]).toMatch(/daysOfMonth/);
  });
});

describe('createReminderSchema recurrence', () => {
  const rule = { frequency: 'weekly', interval: 2, daysOfWeek: ['monday'] };

  it('accepts a rule together with a due date', () => {
    const parsed = createReminderSchema.parse({
      title: 'Gym',
      dueDate: '2026-10-19T14:30:00Z',
      recurrence: rule,
    });
    expect(parsed.recurrence).toEqual(rule);
  });

  it('rejects a rule without a due date', () => {
    const result = createReminderSchema.safeParse({ title: 'Gym', recurrence: rule });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toEqual([
        'A recurring reminder needs a due date: pass dueDate as the first occurrence.',
      ]);
      expect(result.error.issues[0].path).toEqual(['dueDate']);
    }
  });

  it('still accepts reminders without a rule or a due date', () => {
    expect(() => createReminderSchema.parse({ title: 'Milk' })).not.toThrow();
  });
});
