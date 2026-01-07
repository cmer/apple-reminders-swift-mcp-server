import { SwiftExecutor } from '../../executor/swift-executor.js';
import { completeReminderSchema, validateInput } from '../../validation/reminder-schemas.js';
import type { Reminder } from '../../types/reminder.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const completeReminderTool: Tool = {
  name: 'complete_reminder',
  description: 'Mark a reminder as complete',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The reminder ID to mark as complete (required)',
      },
    },
    required: ['id'],
  },
};

export async function completeReminderHandler(
  args: unknown,
  executor: SwiftExecutor
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const validatedArgs = validateInput(completeReminderSchema, args);
  const reminder = await executor.execute<Reminder>('complete-reminder', validatedArgs);

  return {
    content: [
      {
        type: 'text',
        text: `✅ Marked as complete: "${reminder.title}"`,
      },
    ],
  };
}

export const uncompleteReminderTool: Tool = {
  name: 'uncomplete_reminder',
  description: 'Mark a reminder as incomplete',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The reminder ID to mark as incomplete (required)',
      },
    },
    required: ['id'],
  },
};

export async function uncompleteReminderHandler(
  args: unknown,
  executor: SwiftExecutor
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const validatedArgs = validateInput(completeReminderSchema, args);
  const reminder = await executor.execute<Reminder>('uncomplete-reminder', validatedArgs);

  return {
    content: [
      {
        type: 'text',
        text: `⏳ Marked as incomplete: "${reminder.title}"`,
      },
    ],
  };
}

