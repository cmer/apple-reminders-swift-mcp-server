import { SwiftExecutor } from '../../executor/swift-executor.js';
import { updateReminderSchema, validateInput } from '../../validation/reminder-schemas.js';
import type { Reminder } from '../../types/reminder.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const updateReminderTool: Tool = {
  name: 'update_reminder',
  description: 'Update an existing reminder with new attributes',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The reminder ID to update (required)',
      },
      title: {
        type: 'string',
        description: 'New title for the reminder (required)',
      },
      notes: {
        type: 'string',
        description: 'New notes for the reminder',
      },
      listName: {
        type: 'string',
        description: 'Move to a different list',
      },
      dueDate: {
        type: 'string',
        description: 'New due date in ISO 8601 format',
      },
      priority: {
        type: 'number',
        description: 'New priority (0-9)',
        minimum: 0,
        maximum: 9,
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'New tags',
      },
      flagged: {
        type: 'boolean',
        description: 'Whether to flag this reminder',
      },
      url: {
        type: 'string',
        description: 'URL to associate',
      },
    },
    required: ['id', 'title'],
  },
};

export async function updateReminderHandler(
  args: unknown,
  executor: SwiftExecutor
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const validatedArgs = validateInput(updateReminderSchema, args);
  const reminder = await executor.execute<Reminder>('update-reminder', validatedArgs);

  return {
    content: [
      {
        type: 'text',
        text: `✅ Updated reminder: "${reminder.title}"\n\nID: ${reminder.id}\nList: ${reminder.listName}`,
      },
    ],
  };
}

