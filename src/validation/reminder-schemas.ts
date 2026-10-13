import { z } from 'zod';

/** Same text as the Swift CLI's error, so agents see one message whichever side rejects. */
export const RECURRENCE_NEEDS_DUE_DATE =
  'A recurring reminder needs a due date: pass dueDate as the first occurrence.';

/**
 * Recurrence frequency enum
 */
export const recurrenceFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

/**
 * Full lowercase English weekday names, Sunday first
 */
export const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export const weekdaySchema = z.enum(WEEKDAYS, {
  errorMap: () => ({
    message: `daysOfWeek must use full lowercase weekday names: ${WEEKDAYS.join(', ')}`,
  }),
});

/**
 * Recurrence rule schema. The same checks run again in Swift before any EventKit call
 * (RecurrenceRule.validate), so keep the messages in step.
 */
export const recurrenceRuleSchema = z
  .object({
    frequency: recurrenceFrequencySchema,
    interval: z
      .number({ invalid_type_error: 'interval must be a whole number, 1 or greater' })
      .int('interval must be a whole number, 1 or greater')
      .min(1, 'interval must be a whole number, 1 or greater')
      .default(1),
    daysOfWeek: z
      .array(weekdaySchema)
      .min(1, "daysOfWeek can't be empty: omit it to repeat on the due date's weekday")
      .optional(),
  })
  .strict()
  .superRefine((rule, ctx) => {
    if (rule.daysOfWeek !== undefined && rule.frequency !== 'weekly') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['daysOfWeek'],
        message: 'daysOfWeek only applies to weekly rules',
      });
    }
  });

/**
 * Location proximity enum
 */
export const locationProximitySchema = z.enum(['enter', 'leave']);

/**
 * Location schema for location-based reminders
 */
export const locationSchema = z.object({
  title: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive().default(100),
  proximity: locationProximitySchema.default('enter'),
});

/**
 * Alarm type enum
 */
export const alarmTypeSchema = z.enum(['absolute', 'relative']);

/**
 * Alarm schema
 */
export const alarmSchema = z.object({
  type: alarmTypeSchema,
  absoluteDate: z.string().optional(),
  relativeOffset: z.number().optional(), // seconds
});

/**
 * Schema for creating a reminder
 */
export const createReminderSchema = z
  .object({
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
      .optional()
      .describe('Priority: 0=none, 1=high/urgent (!!!), 5=medium, 9=low'),
    flagged: z.boolean().optional(),
    url: z.string().url('URL must be a valid URL').optional(),
    tags: z.array(z.string()).optional(),
    recurrence: recurrenceRuleSchema.optional(),
    location: locationSchema.optional(),
    alarms: z.array(alarmSchema).optional(),
  })
  .superRefine((input, ctx) => {
    if (input.recurrence && !input.dueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dueDate'],
        message: RECURRENCE_NEEDS_DUE_DATE,
      });
    }
  });

/**
 * Schema for updating a reminder
 */
export const updateReminderSchema = z.object({
  id: z.string().min(1, 'Reminder ID is required'),
  title: z.string().min(1, 'Title is required'),
  notes: z.string().optional(),
  listName: z.string().optional(),
  dueDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'dueDate must be a valid ISO 8601 date string',
    })
    .optional(),
  priority: z.number().int().min(0).max(9).optional(),
  flagged: z.boolean().optional(),
  url: z.string().url().optional(),
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
 * Schema for searching reminders
 */
export const searchRemindersSchema = z.object({
  searchText: z.string().min(1, 'Search text is required'),
  completed: z.boolean().optional(),
});

/**
 * Schema for completed reminders query
 */
export const completedRemindersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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
