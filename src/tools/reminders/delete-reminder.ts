import { SwiftExecutor } from '../../executor/swift-executor.js';
import { deleteReminderSchema, validateInput } from '../../validation/reminder-schemas.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const deleteReminderTool: Tool = {
  name: 'delete_reminder',
  description: 'Delete a reminder permanently',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The reminder ID to delete (required)',
      },
    },
    required: ['id'],
  },
};

export async function deleteReminderHandler(
  args: unknown,
  executor: SwiftExecutor
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const validatedArgs = validateInput(deleteReminderSchema, args);
  await executor.execute('delete-reminder', validatedArgs);

  return {
    content: [
      {
        type: 'text',
        text: `✅ Deleted reminder: ${validatedArgs.id}`,
      },
    ],
  };
}

