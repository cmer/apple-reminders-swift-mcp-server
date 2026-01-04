import { z } from 'zod';

/**
 * Schema for creating a reminder
 */
export const createReminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  notes: z.string().optional(),
  listName: z.string().optional(),
  dueDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'dueDate must be a valid ISO 8601 date string',
    })
    .optional(),
  priority: z
    .number()
    .int()
    .min(0, 'Priority must be between 0 and 9')
    .max(9, 'Priority must be between 0 and 9')
    .optional(),
  flagged: z.boolean().optional(),
  url: z.string().url('URL must be a valid URL').optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Schema for getting a reminder
 */
export const getReminderSchema = z.object({
  id: z.string().min(1, 'Reminder ID is required'),
});

/**
 * Schema for listing reminders
 */
export const listRemindersSchema = z.object({
  completed: z.boolean().optional(),
});

/**
 * Schema for completing a reminder
 */
export const completeReminderSchema = z.object({
  id: z.string().min(1, 'Reminder ID is required'),
});

/**
 * Schema for deleting a reminder
 */
export const deleteReminderSchema = z.object({
  id: z.string().min(1, 'Reminder ID is required'),
});

/**
 * Common validation helper
 */
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  return schema.parse(input);
}

