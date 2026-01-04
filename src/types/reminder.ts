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

