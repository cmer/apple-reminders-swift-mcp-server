# Apple Reminders MCP Server - Implementation Plan

**Date**: January 3, 2026
**Architecture**: TypeScript MCP Server → Swift CLI → EventKit → Apple Reminders
**Status**: Ready to implement
**Reference**: [FradSer's mcp-server-apple-events](https://github.com/FradSer/mcp-server-apple-events)

---

## 🎯 Implementation Goals

1. **Create a working end-to-end implementation** with `create_reminder` tool
2. **Validate the architecture** works seamlessly
3. **Establish patterns** for implementing remaining 27+ tools
4. **Set up development workflow** for rapid iteration

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────┐
│   Claude Desktop (MCP Client)      │
│   - Sends natural language         │
│   - Receives tool responses        │
└──────────────┬──────────────────────┘
               │ MCP Protocol (stdio)
               ▼
┌─────────────────────────────────────┐
│   TypeScript MCP Server (src/)     │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Tool Handler Layer          │  │
│   │ - create_reminder.ts        │  │
│   │ - get_reminder.ts           │  │
│   │ - list_reminders.ts         │  │
│   └────────┬────────────────────┘  │
│            │                        │
│   ┌────────▼────────────────────┐  │
│   │ Validation Layer (Zod)     │  │
│   │ - Input validation          │  │
│   │ - Type safety               │  │
│   └────────┬────────────────────┘  │
│            │                        │
│   ┌────────▼────────────────────┐  │
│   │ Swift CLI Executor         │  │
│   │ - execSync wrapper          │  │
│   │ - JSON serialization        │  │
│   │ - Error handling            │  │
│   └────────┬────────────────────┘  │
└────────────┼────────────────────────┘
             │ child_process.execSync
             │ JSON input/output
┌────────────▼────────────────────────┐
│   Swift CLI Binary (swift-cli/)    │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Command Router              │  │
│   │ - Parse JSON args           │  │
│   │ - Route to managers         │  │
│   │ - Serialize JSON response   │  │
│   └────────┬────────────────────┘  │
│            │                        │
│   ┌────────▼────────────────────┐  │
│   │ ReminderManager             │  │
│   │ - CRUD operations           │  │
│   │ - Recurrence handling       │  │
│   │ - Location handling         │  │
│   └────────┬────────────────────┘  │
│            │                        │
│   ┌────────▼────────────────────┐  │
│   │ ListManager                 │  │
│   │ - List CRUD                 │  │
│   │ - Default list handling     │  │
│   └────────┬────────────────────┘  │
│            │                        │
│   ┌────────▼────────────────────┐  │
│   │ EventKitBridge              │  │
│   │ - EKEventStore              │  │
│   │ - Permission requests       │  │
│   │ - Predicate queries         │  │
│   └────────┬────────────────────┘  │
└────────────┼────────────────────────┘
             │ EventKit Framework
             ▼
┌─────────────────────────────────────┐
│   Apple Reminders.app (macOS)       │
└─────────────────────────────────────┘
```

---

## 📁 Project Structure (Detailed)

```
apple-reminders-mcp-server/
├── swift-cli/                          # Swift CLI Package
│   ├── Package.swift                   # SPM manifest
│   ├── .swiftpm/                       # SPM cache (gitignored)
│   ├── Sources/
│   │   ├── RemindersKit/               # Library target
│   │   │   ├── EventKitBridge.swift    # EKEventStore wrapper
│   │   │   ├── ReminderManager.swift   # Reminder CRUD operations
│   │   │   ├── ListManager.swift       # List operations
│   │   │   ├── Models/
│   │   │   │   ├── Reminder.swift      # Reminder model (Codable)
│   │   │   │   ├── ReminderList.swift  # List model
│   │   │   │   ├── RecurrenceRule.swift
│   │   │   │   ├── Location.swift
│   │   │   │   └── Alarm.swift
│   │   │   ├── Extensions/
│   │   │   │   ├── EKReminder+Extensions.swift
│   │   │   │   ├── EKCalendar+Extensions.swift
│   │   │   │   └── Date+Extensions.swift
│   │   │   └── Utilities/
│   │   │       ├── JSONEncoder+Pretty.swift
│   │   │       └── ErrorHandler.swift
│   │   └── reminders-cli/              # Executable target
│   │       ├── main.swift              # CLI entry point
│   │       ├── CommandRouter.swift     # Routes commands to managers
│   │       └── Commands/
│   │           ├── CreateReminderCommand.swift
│   │           ├── GetReminderCommand.swift
│   │           └── ListRemindersCommand.swift
│   ├── Tests/
│   │   └── RemindersKitTests/
│   │       ├── ReminderManagerTests.swift
│   │       ├── ListManagerTests.swift
│   │       └── EventKitBridgeTests.swift
│   └── .build/                         # Build artifacts (gitignored)
│
├── src/                                # TypeScript MCP Server
│   ├── index.ts                        # MCP server entry point
│   ├── server.ts                       # Server setup with SDK
│   ├── tools/                          # Tool handlers
│   │   ├── reminders/
│   │   │   ├── create-reminder.ts      # Tool: create_reminder
│   │   │   ├── get-reminder.ts         # Tool: get_reminder
│   │   │   ├── update-reminder.ts
│   │   │   ├── delete-reminder.ts
│   │   │   ├── complete-reminder.ts
│   │   │   └── uncomplete-reminder.ts
│   │   ├── lists/
│   │   │   ├── create-list.ts
│   │   │   ├── get-list.ts
│   │   │   ├── get-all-lists.ts
│   │   │   ├── update-list.ts
│   │   │   └── delete-list.ts
│   │   ├── search/
│   │   │   ├── search-reminders.ts
│   │   │   ├── get-reminders-by-date.ts
│   │   │   ├── get-reminders-by-tag.ts
│   │   │   ├── get-completed-reminders.ts
│   │   │   ├── get-overdue-reminders.ts
│   │   │   ├── get-todays-reminders.ts
│   │   │   └── get-flagged-reminders.ts
│   │   └── batch/
│   │       ├── batch-create-reminders.ts
│   │       ├── batch-update-reminders.ts
│   │       ├── batch-complete-reminders.ts
│   │       ├── batch-delete-reminders.ts
│   │       └── move-reminders-to-list.ts
│   ├── executor/                       # Swift CLI executor
│   │   ├── swift-executor.ts           # Executes Swift CLI binary
│   │   ├── command-builder.ts          # Builds CLI commands
│   │   ├── response-parser.ts          # Parses CLI JSON responses
│   │   └── types.ts                    # TypeScript types for CLI I/O
│   ├── validation/                     # Zod schemas
│   │   ├── reminder-schemas.ts         # Reminder validation schemas
│   │   ├── list-schemas.ts             # List validation schemas
│   │   └── common-schemas.ts           # Shared schemas (dates, etc.)
│   ├── utils/                          # Utilities
│   │   ├── logger.ts                   # Winston/Pino logger
│   │   ├── error-mapper.ts             # Maps errors to MCP format
│   │   └── date-utils.ts               # Date parsing/formatting
│   └── types/                          # TypeScript type definitions
│       ├── reminder.ts                 # Reminder types
│       ├── list.ts                     # List types
│       ├── mcp.ts                      # MCP-specific types
│       └── error.ts                    # Error types
│
├── tests/                              # Tests
│   ├── unit/
│   │   ├── tools/                      # Tool handler unit tests
│   │   ├── executor/                   # Executor unit tests
│   │   └── validation/                 # Validation tests
│   ├── integration/                    # Integration tests
│   │   ├── create-reminder.test.ts
│   │   ├── list-operations.test.ts
│   │   └── search-operations.test.ts
│   └── fixtures/                       # Test data
│       ├── reminders.json
│       └── lists.json
│
├── docs/                               # Documentation
│   ├── architecture.md                 # Architecture details
│   ├── development.md                  # Development guide
│   └── api/                            # API docs per tool
│       ├── create-reminder.md
│       ├── get-reminder.md
│       └── ...
│
├── scripts/                            # Build and utility scripts
│   ├── build-swift-cli.sh              # Compiles Swift CLI
│   ├── watch-swift-cli.sh              # Watch mode for Swift
│   ├── setup.sh                        # Initial setup script
│   └── clean.sh                        # Clean build artifacts
│
├── package.json                        # Node.js dependencies
├── tsconfig.json                       # TypeScript config
├── .eslintrc.json                      # ESLint config
├── .prettierrc                         # Prettier config
├── .gitignore                          # Git ignore patterns
├── README.md                           # Project README
├── CURRENT_STATE.md                    # Current state (existing)
├── PIVOT.md                            # Pivot rationale (existing)
└── spec.md                             # Specification (existing)
```

---

## 🔧 Phase 1: Foundation Setup

### Step 1.1: Swift Package Manager Project

**Goal**: Create a Swift CLI that can interact with EventKit and output JSON

**Tasks**:
1. Initialize Swift Package Manager project
2. Create library target (`RemindersKit`) and executable target (`reminders-cli`)
3. Set up basic EventKit integration with permission handling
4. Implement JSON-based CLI interface
5. Create first command: `create-reminder`

**Files to create**:
- `swift-cli/Package.swift`
- `swift-cli/Sources/RemindersKit/EventKitBridge.swift`
- `swift-cli/Sources/RemindersKit/ReminderManager.swift`
- `swift-cli/Sources/RemindersKit/Models/Reminder.swift`
- `swift-cli/Sources/reminders-cli/main.swift`
- `swift-cli/Sources/reminders-cli/CommandRouter.swift`

**Key Swift patterns**:
```swift
// EventKitBridge.swift - Permission handling
class EventKitBridge {
    private let eventStore = EKEventStore()
    
    func requestAccess() async throws -> Bool {
        if #available(macOS 14.0, *) {
            return try await eventStore.requestFullAccessToReminders()
        } else {
            return try await eventStore.requestAccess(to: .reminder)
        }
    }
    
    func getDefaultRemindersList() -> EKCalendar? {
        return eventStore.defaultCalendarForNewReminders()
    }
}

// ReminderManager.swift - Create reminder
class ReminderManager {
    private let eventStore: EKEventStore
    
    func createReminder(title: String, notes: String?, dueDate: Date?, 
                       priority: Int?, listId: String?) throws -> Reminder {
        let reminder = EKReminder(eventStore: eventStore)
        reminder.title = title
        reminder.notes = notes
        reminder.dueDateComponents = dueDate?.dateComponents
        reminder.priority = priority ?? 0
        
        let calendar = listId != nil 
            ? getList(by: listId!) 
            : eventStore.defaultCalendarForNewReminders()
        
        reminder.calendar = calendar
        
        try eventStore.save(reminder, commit: true)
        
        return Reminder(from: reminder)
    }
}

// main.swift - CLI entry point
@main
struct RemindersCLI {
    static func main() async {
        let args = CommandLine.arguments
        
        guard args.count >= 2 else {
            printError("Missing command")
            exit(1)
        }
        
        let command = args[1]
        let jsonInput = args.count >= 3 ? args[2] : "{}"
        
        do {
            let router = CommandRouter()
            let result = try await router.route(command: command, jsonInput: jsonInput)
            print(result) // JSON output
        } catch {
            printError(error)
            exit(1)
        }
    }
}
```

### Step 1.2: TypeScript MCP Server Project

**Goal**: Create a TypeScript MCP server with proper tooling

**Tasks**:
1. Initialize Node.js project with TypeScript
2. Install MCP SDK and dependencies
3. Set up ESLint, Prettier, Vitest
4. Create basic MCP server structure
5. Implement Swift CLI executor layer

**Files to create**:
- `package.json`
- `tsconfig.json`
- `.eslintrc.json`
- `.prettierrc`
- `src/index.ts`
- `src/server.ts`
- `src/executor/swift-executor.ts`
- `src/executor/types.ts`
- `src/types/reminder.ts`
- `src/validation/reminder-schemas.ts`

**Key TypeScript patterns**:
```typescript
// executor/swift-executor.ts - Execute Swift CLI
import { execSync } from 'child_process';
import path from 'path';

export interface SwiftExecutorOptions {
  cliPath: string;
  timeout?: number;
}

export class SwiftExecutor {
  private cliPath: string;
  private timeout: number;

  constructor(options: SwiftExecutorOptions) {
    this.cliPath = options.cliPath;
    this.timeout = options.timeout || 10000;
  }

  async execute<T>(command: string, args: Record<string, any>): Promise<T> {
    const jsonInput = JSON.stringify(args);
    
    try {
      const result = execSync(
        `${this.cliPath} ${command} '${jsonInput}'`,
        {
          encoding: 'utf-8',
          timeout: this.timeout,
          stdio: ['pipe', 'pipe', 'pipe']
        }
      );
      
      return JSON.parse(result) as T;
    } catch (error) {
      throw this.mapError(error);
    }
  }

  private mapError(error: any): Error {
    // Map Swift CLI errors to MCP errors
    if (error.stderr) {
      const stderr = error.stderr.toString();
      // Parse error JSON from stderr
      try {
        const errorObj = JSON.parse(stderr);
        return new MCPError(errorObj.code, errorObj.message);
      } catch {
        return new MCPError('INTERNAL_ERROR', stderr);
      }
    }
    return error;
  }
}

// server.ts - MCP server setup
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createReminderTool } from './tools/reminders/create-reminder.js';
import { SwiftExecutor } from './executor/swift-executor.js';

export async function createServer() {
  const server = new Server(
    {
      name: 'apple-reminders',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const swiftExecutor = new SwiftExecutor({
    cliPath: path.join(__dirname, '../swift-cli/.build/release/reminders-cli')
  });

  // Register tools
  server.setRequestHandler('tools/list', async () => ({
    tools: [
      createReminderTool.definition,
      // ... other tools
    ]
  }));

  server.setRequestHandler('tools/call', async (request) => {
    const { name, arguments: args } = request.params;
    
    switch (name) {
      case 'create_reminder':
        return createReminderTool.handler(args, swiftExecutor);
      // ... other tools
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  return server;
}

// tools/reminders/create-reminder.ts - Tool handler
import { z } from 'zod';
import { SwiftExecutor } from '../../executor/swift-executor.js';
import { reminderInputSchema } from '../../validation/reminder-schemas.js';

export const createReminderTool = {
  definition: {
    name: 'create_reminder',
    description: 'Create a new reminder in Apple Reminders',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The reminder title (required)'
        },
        notes: {
          type: 'string',
          description: 'Additional notes for the reminder'
        },
        listName: {
          type: 'string',
          description: 'Name of the list to add the reminder to'
        },
        dueDate: {
          type: 'string',
          description: 'Due date in ISO 8601 format'
        },
        priority: {
          type: 'number',
          description: 'Priority: 0 (none), 1-4 (low), 5 (medium), 6-9 (high)',
          minimum: 0,
          maximum: 9
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of tag names'
        },
        flagged: {
          type: 'boolean',
          description: 'Whether to flag this reminder'
        }
      },
      required: ['title']
    }
  },

  async handler(args: unknown, executor: SwiftExecutor) {
    // Validate input
    const validatedArgs = reminderInputSchema.parse(args);

    // Execute Swift CLI
    const result = await executor.execute('create-reminder', validatedArgs);

    return {
      content: [
        {
          type: 'text',
          text: `Created reminder: ${result.title}\nID: ${result.id}`
        }
      ]
    };
  }
};
```

### Step 1.3: Build Scripts and Workflow

**Goal**: Streamline development with automated build scripts

**Tasks**:
1. Create Swift build script
2. Create TypeScript build script
3. Set up watch mode for development
4. Create setup script for initial project setup

**Files to create**:
- `scripts/build-swift-cli.sh`
- `scripts/watch-swift-cli.sh`
- `scripts/setup.sh`
- `scripts/clean.sh`

**Build scripts**:
```bash
# scripts/build-swift-cli.sh
#!/bin/bash
set -e

echo "Building Swift CLI..."
cd swift-cli
swift build --configuration release
echo "✅ Swift CLI built successfully"
echo "Binary location: .build/release/reminders-cli"

# scripts/setup.sh
#!/bin/bash
set -e

echo "🚀 Setting up Apple Reminders MCP Server..."

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build Swift CLI
echo "🔨 Building Swift CLI..."
./scripts/build-swift-cli.sh

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run dev' to start the MCP server"
echo "  2. Add server to Claude Desktop config"
echo "  3. Test with natural language commands"
```

---

## 🎯 Phase 2: Implement First Tool (create_reminder)

### Step 2.1: Swift CLI Implementation

**Files**:
1. `swift-cli/Sources/RemindersKit/Models/Reminder.swift`
2. `swift-cli/Sources/RemindersKit/ReminderManager.swift`
3. `swift-cli/Sources/reminders-cli/Commands/CreateReminderCommand.swift`

**Implementation order**:
1. Create `Reminder` model (Codable struct)
2. Implement `ReminderManager.createReminder()`
3. Create `CreateReminderCommand` that parses JSON input
4. Test Swift CLI directly: `./reminders-cli create-reminder '{"title":"Test"}'`

### Step 2.2: TypeScript MCP Server Implementation

**Files**:
1. `src/types/reminder.ts`
2. `src/validation/reminder-schemas.ts`
3. `src/tools/reminders/create-reminder.ts`
4. `src/server.ts` (register tool)

**Implementation order**:
1. Define TypeScript types for Reminder
2. Create Zod schema for validation
3. Implement tool handler
4. Register tool in server
5. Test with MCP Inspector

### Step 2.3: Integration Testing

**Test workflow**:
1. **Direct Swift CLI test**: 
   ```bash
   ./swift-cli/.build/release/reminders-cli create-reminder '{"title":"Test Reminder"}'
   ```

2. **Node.js executor test**:
   ```typescript
   const executor = new SwiftExecutor({ cliPath: '...' });
   const result = await executor.execute('create-reminder', { title: 'Test' });
   console.log(result);
   ```

3. **MCP Inspector test**: Test tool via MCP protocol

4. **Claude Desktop test**: Use natural language to create reminder

---

## 📦 Dependencies

### Swift Dependencies
```swift
// Package.swift
dependencies: [
    // No external dependencies - EventKit is built-in
],
targets: [
    .target(
        name: "RemindersKit",
        dependencies: []
    ),
    .executableTarget(
        name: "reminders-cli",
        dependencies: ["RemindersKit"]
    ),
]
```

### Node.js Dependencies
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.4",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

---

## 🚀 Development Workflow

### Day-to-day development:

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Make changes to Swift CLI**:
   ```bash
   # Rebuild Swift CLI
   ./scripts/build-swift-cli.sh
   
   # Restart Node.js server (or use nodemon)
   npm run dev
   ```

3. **Test changes**:
   - MCP Inspector for tool testing
   - Claude Desktop for natural language testing
   - Unit tests: `npm test`

4. **Commit working features**:
   ```bash
   git add .
   git commit -m "feat: implement create_reminder tool"
   ```

---

## ✅ Success Criteria for Phase 1

### Swift CLI
- [ ] Swift CLI builds successfully
- [ ] Can request EventKit permissions
- [ ] Can create a reminder via JSON input
- [ ] Returns JSON output with reminder details
- [ ] Handles errors gracefully (JSON error output)

### TypeScript MCP Server
- [ ] MCP server starts without errors
- [ ] Tool `create_reminder` is registered
- [ ] Can execute Swift CLI and parse response
- [ ] Validates input with Zod
- [ ] Returns MCP-compliant response

### Integration
- [ ] Can create reminder end-to-end from MCP client
- [ ] Reminder appears in Apple Reminders.app
- [ ] Error handling works (invalid input, permissions, etc.)
- [ ] Claude Desktop can create reminders via natural language

---

## 🎯 Next Steps After Phase 1

Once `create_reminder` is working:

1. **Implement read operations** (get_reminder, list_reminders)
2. **Implement update/delete** (update_reminder, delete_reminder, complete_reminder)
3. **Implement list management** (create_list, get_all_lists)
4. **Add search tools** (search_reminders, get_todays_reminders)
5. **Add advanced features** (recurring reminders, location-based)
6. **Add batch operations**
7. **Polish error handling and testing**
8. **Create comprehensive documentation**

---

## 🏗️ Reference Patterns from FradSer

Study [mcp-server-apple-events](https://github.com/FradSer/mcp-server-apple-events) for:

1. **Swift CLI structure** - How to organize Swift code
2. **Build process** - How to compile and distribute binaries
3. **Permission handling** - How to request macOS permissions
4. **Error handling patterns** - How to return structured errors
5. **Distribution** - How to package pre-compiled binaries

Key files to reference:
- Swift Package Manager setup
- CLI entry point and command routing
- TypeScript executor pattern
- Build scripts

---

## 🚧 Known Challenges & Solutions

### Challenge 1: EventKit Permissions
**Issue**: App must request permission to access Reminders
**Solution**: 
- Swift CLI requests permission on first run
- Guide user to grant permission in System Settings
- Provide clear error message if permission denied

### Challenge 2: Date/Time Handling
**Issue**: Date parsing between TypeScript and Swift
**Solution**:
- Use ISO 8601 format for all dates
- Swift: Use `ISO8601DateFormatter`
- TypeScript: Use native `Date` with `.toISOString()`

### Challenge 3: Tag Workaround
**Issue**: Tags not available via EventKit
**Solution**:
- Encode tags as `[#tag]` in notes field
- Create helper functions to parse/search tags
- Document limitation clearly

### Challenge 4: Swift CLI Distribution
**Issue**: Users need compiled binary
**Solution** (Post-MVP):
- Pre-compile for Apple Silicon and Intel
- Include binaries in npm package
- Provide build instructions for development

---

## 📝 Git Commit Strategy

Commit working features frequently:

1. `feat: initialize Swift Package Manager project`
2. `feat: add EventKit integration and permission handling`
3. `feat: implement ReminderManager.createReminder()`
4. `feat: add CLI entry point and command router`
5. `feat: initialize TypeScript MCP server project`
6. `feat: implement Swift CLI executor`
7. `feat: implement create_reminder tool handler`
8. `feat: register create_reminder tool in MCP server`
9. `test: add integration test for create_reminder`
10. `docs: add setup and usage instructions to README`

---

**Ready to implement!** 🚀

Let's start with Swift CLI setup, then move to TypeScript MCP server, then connect them together.

