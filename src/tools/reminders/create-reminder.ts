import { SwiftExecutor } from '../../executor/swift-executor.js';
import { createReminderSchema, validateInput, WEEKDAYS } from '../../validation/reminder-schemas.js';
import type { Reminder, CreateReminderInput } from '../../types/reminder.js';
import { recurrenceSummaryLine } from '../recurrence-summary.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Tool definition for create_reminder
 */
export const createReminderTool: Tool = {
  name: 'create_reminder',
  description: 'Create a new reminder in Apple Reminders with comprehensive attributes',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'The reminder title/name (required)',
      },
      notes: {
        type: 'string',
        description: 'Additional notes or description for the reminder',
      },
      listName: {
        type: 'string',
        description: 'Name of the list to add reminder to (defaults to default list)',
      },
      dueDate: {
        type: 'string',
        description:
          'Due date in ISO 8601 format (e.g., "2024-12-31T14:00:00Z"). Required when recurrence is set: it is the first occurrence.',
      },
      priority: {
        type: 'number',
        description: 'Priority: 0=none, 1=high/urgent (!!!), 5=medium, 9=low',
        minimum: 0,
        maximum: 9,
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of tag names to apply (encoded as [#tag] in notes)',
      },
      flagged: {
        type: 'boolean',
        description: 'Whether to flag this reminder',
      },
      url: {
        type: 'string',
        description: 'URL to associate with the reminder',
      },
      recurrence: {
        type: 'object',
        description:
          'Make this a recurring reminder. Requires dueDate, which is the first occurrence. Completing an occurrence moves the reminder to its next one.',
        properties: {
          frequency: {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly', 'yearly'],
            description: 'How often the reminder repeats',
          },
          interval: {
            type: 'integer',
            minimum: 1,
            description:
              'Repeat every N days/weeks/months/years (default 1; 2 with weekly means every other week)',
          },
          daysOfWeek: {
            type: 'array',
            items: { type: 'string', enum: [...WEEKDAYS] },
            minItems: 1,
            description:
              'Weekly only: full lowercase weekday names to repeat on (e.g. ["monday", "wednesday"]). Omit to repeat on the weekday of dueDate.',
          },
        },
        required: ['frequency'],
        additionalProperties: false,
      },
    },
    required: ['title'],
  },
};

/**
 * Handler for create_reminder tool
 */
export async function createReminderHandler(
  args: unknown,
  executor: SwiftExecutor
): Promise<{ content: Array<{ type: string; text: string }> }> {
  // Validate input
  const validatedArgs = validateInput(createReminderSchema, args) as CreateReminderInput;

  // Execute Swift CLI
  const reminder = await executor.execute<Reminder>('create-reminder', validatedArgs);

  // Format response for MCP
  const recurrenceLine = recurrenceSummaryLine(reminder);
  const responseText = `✅ Created reminder: "${reminder.title}"

ID: ${reminder.id}
List: ${reminder.listName}
${reminder.dueDate ? `Due: ${new Date(reminder.dueDate).toLocaleString()}` : 'No due date'}
${recurrenceLine ? `${recurrenceLine}\n` : ''}${reminder.priority > 0 ? `Priority: ${formatPriority(reminder.priority)}` : ''}
${reminder.notes ? `\nNotes:\n${reminder.notes}` : ''}`;

  return {
    content: [
      {
        type: 'text',
        text: responseText,
      },
    ],
  };
}

/**
 * Format priority number to human-readable string
 */
export function formatPriority(priority: number): string {
  if (priority === 0) return 'None';
  if (priority === 1) return 'High (Urgent !!!)';
  if (priority >= 2 && priority <= 4) return 'High';
  if (priority === 5) return 'Medium';
  if (priority >= 6 && priority <= 9) return 'Low';
  return 'None';
}

