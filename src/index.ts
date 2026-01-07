#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SwiftExecutor } from './executor/swift-executor.js';
import { MCPError, MCPErrorCode } from './types/error.js';

// Tool imports
import { createReminderTool, createReminderHandler } from './tools/reminders/create-reminder.js';
import { updateReminderTool, updateReminderHandler } from './tools/reminders/update-reminder.js';
import { deleteReminderTool, deleteReminderHandler } from './tools/reminders/delete-reminder.js';
import {
  completeReminderTool,
  completeReminderHandler,
  uncompleteReminderTool,
  uncompleteReminderHandler,
} from './tools/reminders/complete-reminder.js';
import { getRemindersListTool, getRemindersListHandler } from './tools/reminders/get-reminders.js';
import { getAllListsTool, getAllListsHandler } from './tools/lists/get-all-lists.js';
import { searchRemindersTool, searchRemindersHandler } from './tools/search/search-reminders.js';
import {
  getTodaysRemindersTool,
  getTodaysRemindersHandler,
  getOverdueRemindersTool,
  getOverdueRemindersHandler,
  getCompletedRemindersTool,
  getCompletedRemindersHandler,
} from './tools/search/date-based-reminders.js';

/**
 * Create and configure the MCP server
 */
async function main() {
  // Initialize Swift executor
  const swiftExecutor = new SwiftExecutor();

  // Create MCP server
  const server = new Server(
    {
      name: 'apple-reminders',
      version: '0.2.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tools/list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      // Reminder CRUD
      createReminderTool,
      updateReminderTool,
      deleteReminderTool,
      completeReminderTool,
      uncompleteReminderTool,
      getRemindersListTool,
      
      // Lists
      getAllListsTool,
      
      // Search
      searchRemindersTool,
      getTodaysRemindersTool,
      getOverdueRemindersTool,
      getCompletedRemindersTool,
    ],
  }));

  // Register tools/call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'create_reminder':
          return await createReminderHandler(args, swiftExecutor);

        case 'update_reminder':
          return await updateReminderHandler(args, swiftExecutor);

        case 'delete_reminder':
          return await deleteReminderHandler(args, swiftExecutor);

        case 'complete_reminder':
          return await completeReminderHandler(args, swiftExecutor);

        case 'uncomplete_reminder':
          return await uncompleteReminderHandler(args, swiftExecutor);

        case 'get_reminders':
          return await getRemindersListHandler(args, swiftExecutor);

        case 'get_all_lists':
          return await getAllListsHandler(args, swiftExecutor);

        case 'search_reminders':
          return await searchRemindersHandler(args, swiftExecutor);

        case 'get_todays_reminders':
          return await getTodaysRemindersHandler(args, swiftExecutor);

        case 'get_overdue_reminders':
          return await getOverdueRemindersHandler(args, swiftExecutor);

        case 'get_completed_reminders':
          return await getCompletedRemindersHandler(args, swiftExecutor);

        default:
          throw new MCPError(MCPErrorCode.INVALID_INPUT, `Unknown tool: ${name}`);
      }
    } catch (error) {
      // Handle errors
      if (error instanceof MCPError) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}\nCode: ${error.code}`,
            },
          ],
          isError: true,
        };
      }

      // Zod validation errors
      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as { issues: Array<{ path: string[]; message: string }> };
        const errorMessages = zodError.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('\n');
        return {
          content: [
            {
              type: 'text',
              text: `Validation Error:\n${errorMessages}`,
            },
          ],
          isError: true,
        };
      }

      // Generic error
      return {
        content: [
          {
            type: 'text',
            text: `Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Connect to transport (stdio)
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is used for MCP protocol)
  console.error('Apple Reminders MCP Server v0.2.0 running on stdio');
  console.error('Available tools: 12 (CRUD, search, lists, date-based queries)');
}

// Run the server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

