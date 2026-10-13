import type { RecurrenceRule, Reminder, Weekday } from '../types/reminder.js';

/** Sunday first, the order Reminders.app lists weekdays in. */
const WEEKDAYS: Array<{ name: Weekday; abbreviation: string }> = [
  { name: 'sunday', abbreviation: 'Sun' },
  { name: 'monday', abbreviation: 'Mon' },
  { name: 'tuesday', abbreviation: 'Tue' },
  { name: 'wednesday', abbreviation: 'Wed' },
  { name: 'thursday', abbreviation: 'Thu' },
  { name: 'friday', abbreviation: 'Fri' },
  { name: 'saturday', abbreviation: 'Sat' },
];

const UNITS = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
} as const;

/**
 * Describe a recurrence rule the way Reminders.app does, e.g. "Every 2 weeks on Mon, Wed".
 * Deterministic: no locale or clock involved.
 */
export function formatRecurrenceSummary(rule: RecurrenceRule): string {
  const unit = UNITS[rule.frequency];
  const interval = rule.interval ?? 1;
  const every = interval === 1 ? `Every ${unit}` : `Every ${interval} ${unit}s`;

  if (rule.frequency === 'weekly' && rule.daysOfWeek && rule.daysOfWeek.length > 0) {
    const days = WEEKDAYS.filter((day) => rule.daysOfWeek?.includes(day.name))
      .map((day) => day.abbreviation)
      .join(', ');
    return `${every} on ${days}`;
  }
  return every;
}

/**
 * The "🔁 <summary>" line for a recurring reminder, or undefined for any other reminder.
 */
export function recurrenceSummaryLine(reminder: Reminder): string | undefined {
  return reminder.recurrence ? `🔁 ${formatRecurrenceSummary(reminder.recurrence)}` : undefined;
}
