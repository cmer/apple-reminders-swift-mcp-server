/**
 * Reminder list (calendar) data model
 */
export interface ReminderList {
  id: string;
  title: string;
  color?: string;
  type: string;
  allowsContentModifications: boolean;
}

