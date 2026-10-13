export type Weekday =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Recurrence rule, used for input (create) and output (get_reminder, list tools)
 */
export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // integer >= 1
  daysOfWeek?: Weekday[]; // weekly only
}

/**
 * Reminder data model
 */
export interface Reminder {
  id: string;
  title: string;
  notes?: string;
  isCompleted: boolean;
  priority: number;
  dueDate?: string; // ISO 8601 format
  completionDate?: string;
  creationDate?: string;
  modificationDate?: string;
  listId: string;
  listName: string;
  flagged: boolean;
  url?: string;
  hasAlarms: boolean;
  hasRecurrenceRules: boolean;
  recurrence: RecurrenceRule | null; // null for a reminder that doesn't repeat
  dueDateHasTime: boolean; // false for a date-only due date
}

/**
 * Input for creating a reminder
 */
export interface CreateReminderInput {
  title: string;
  notes?: string;
  listName?: string;
  dueDate?: string; // ISO 8601 format
  priority?: number; // 0-9 scale
  flagged?: boolean;
  url?: string;
  tags?: string[];
  recurrence?: RecurrenceRule;
}

/**
 * Input for updating a reminder
 */
export interface UpdateReminderInput {
  id: string;
  title?: string;
  notes?: string;
  listName?: string;
  dueDate?: string;
  priority?: number;
  flagged?: boolean;
  url?: string;
  tags?: string[];
}

