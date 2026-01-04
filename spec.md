# Apple Reminders MCP Server - Specification

## Project Overview

A comprehensive Model Context Protocol (MCP) server that provides full integration with Apple Reminders on macOS. This server enables AI assistants (like Claude) to interact with Apple Reminders using natural language, supporting all native features available in the Apple Reminders app.

## Goals & Objectives

### Primary Goal
Create a production-ready MCP server that exposes complete Apple Reminders functionality through a well-designed, type-safe API that AI assistants can use effectively.

### Secondary Goals
- Serve as a learning project for MCP development, TypeScript/Node.js, and macOS automation
- Demonstrate best practices for MCP server architecture and development workflows
- Provide a reference implementation for comprehensive Apple ecosystem integration

### Use Case
**AI Assistant Integration**: Enable Claude and other AI assistants to manage Apple Reminders via natural language commands, allowing users to create, search, update, and organize reminders conversationally.

## Technical Architecture

### Technology Stack

**Runtime & Language**
- **Node.js** (v18 or later)
- **TypeScript** with strict mode enabled
- **ES Modules** for modern JavaScript features

**MCP Integration**
- **@modelcontextprotocol/sdk** - Official MCP SDK for TypeScript
- Fine-grained tool design (many specific tools for better AI discoverability)

**Apple Reminders Access**
- **Swift + EventKit** - Primary integration method
  - Native macOS EventKit framework for full reminder access
  - Compiled Swift CLI binary for performance and reliability
  - Direct access to EventKit APIs (no scripting layer)
  - Support for recurring reminders and location-based features
  - TypeScript MCP server executes Swift CLI via child_process

**Development Tools**
- **Zod** - Runtime type validation and schema definition
- **Winston** or **Pino** - Structured logging
- **tsx** - TypeScript execution with hot reload
- **Vitest** - Fast unit testing framework
- **ESLint** + **Prettier** - Code quality and formatting

### Architecture Patterns

```
┌─────────────────────────────────────┐
│   MCP Client (Claude Desktop)      │
│                                     │
└──────────────┬──────────────────────┘
               │ MCP Protocol (stdio)
               │
┌──────────────▼──────────────────────┐
│   MCP Server (TypeScript/Node.js)   │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Tool Handlers (Fine-grained)│  │
│  └───────────┬──────────────────┘  │
│              │                      │
│  ┌───────────▼──────────────────┐  │
│  │  Validation Layer (Zod)      │  │
│  └───────────┬──────────────────┘  │
│              │                      │
│  ┌───────────▼──────────────────┐  │
│  │  Swift CLI Executor          │  │
│  │  (child_process + JSON)      │  │
│  └───────────┬──────────────────┘  │
└──────────────┼──────────────────────┘
               │ Process boundary
               │ (JSON input/output)
┌──────────────▼──────────────────────┐
│   Swift CLI Binary                  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Command Router              │  │
│  └───────────┬──────────────────┘  │
│              │                      │
│  ┌───────────▼──────────────────┐  │
│  │  EventKit Integration        │  │
│  │  (EKEventStore, EKReminder)  │  │
│  └───────────┬──────────────────┘  │
└──────────────┼──────────────────────┘
               │ EventKit Framework
               │
┌──────────────▼──────────────────────┐
│   Apple Reminders.app (macOS)       │
└─────────────────────────────────────┘
```

### Project Structure

```
apple-reminders-mcp-server/
├── swift-cli/                   # Swift CLI binary
│   ├── Package.swift           # Swift Package Manager manifest
│   ├── Sources/
│   │   ├── RemindersKit/       # Main library
│   │   │   ├── ReminderManager.swift
│   │   │   ├── ListManager.swift
│   │   │   ├── EventKitBridge.swift
│   │   │   └── Models/         # Swift data models
│   │   └── reminders-cli/      # CLI executable
│   │       └── main.swift      # CLI entry point
│   └── Tests/
│       └── RemindersKitTests/
├── src/                        # TypeScript MCP Server
│   ├── index.ts                # MCP server entry point
│   ├── server.ts               # MCP server setup and configuration
│   ├── tools/                  # MCP tool handlers
│   │   ├── reminders/          # Reminder CRUD operations
│   │   ├── lists/              # List management operations
│   │   ├── search/             # Search and filter operations
│   │   └── batch/              # Batch operations
│   ├── executor/               # Swift CLI executor layer
│   │   ├── swift-executor.ts   # Executes Swift CLI binary
│   │   └── types.ts            # TypeScript types for CLI I/O
│   ├── validation/             # Zod schemas and validators
│   ├── utils/                  # Shared utilities
│   └── types/                  # TypeScript type definitions
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── fixtures/               # Test data and mocks
├── docs/
│   ├── architecture.md         # Architecture documentation
│   ├── api/                    # API reference for each tool
│   └── development.md          # Development guide
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── README.md
```

## Feature Requirements

### Apple Reminders Feature Coverage (~70%)

**Note**: EventKit provides access to most Apple Reminders features. However, **tags** and **subtasks** are only available through private Apple APIs and cannot be accessed via EventKit. This implementation will provide workarounds for these features.

#### 1. Core Reminder Attributes (Fully Supported)
- **Title** (required) - Reminder name/description
- **Notes** - Rich text notes (Markdown-compatible)
- **Completion Status** - Completed vs incomplete
- **Priority** - None, Low, Medium, High (0-9 in macOS)
- **Due Date** - Optional date/time when reminder is due
- **URLs** - Associated web links
- **Flagged Status** - Mark as flagged for importance
- **⚠️ Tags** - NOT natively supported (workaround: encode as `[#tag]` in notes)
- **Creation/Modification Dates** - Automatically tracked by EventKit

#### 2. Advanced Scheduling (Fully Supported via EventKit)
- **✅ Recurring Reminders** - Daily, weekly, monthly, yearly, custom intervals
- **✅ Recurrence Rules** - Complex patterns via EKRecurrenceRule
- **✅ End Repeat** - Never, on date, after N occurrences
- **✅ Multiple Alarms** - Support for multiple notification times via EKAlarm
- **✅ Time-of-Day Reminders** - Specific time vs all-day
- **✅ Relative Alarms** - Trigger at offset from due date (e.g., 1 day before)
- **✅ Absolute Alarms** - Trigger at specific date/time

#### 3. Organization (Partially Supported)
- **✅ Lists** - Organize reminders into lists (EKCalendar)
- **✅ List Colors** - Visual customization via EKCalendar.color
- **✅ Default List** - Set default list for new reminders
- **⚠️ Smart Lists** - NOT accessible via EventKit (built-in to Reminders.app UI only)
- **⚠️ List Groups** - NOT accessible via EventKit
- **⚠️ Subtasks** - NOT natively supported (workaround: linked reminders or structured notes)

#### 4. Location & Context (Fully Supported via EventKit)
- **✅ Location-based Reminders** - Trigger at arrival/departure via EKStructuredLocation
- **✅ Geofence Radius** - Customizable proximity trigger
- **✅ Proximity Alarms** - Arriving/leaving location triggers
- **✅ URLs** - Associate web links with reminders
- **⚠️ Attachments** - NOT supported via EventKit (private API only)
- **⚠️ Contact Association** - NOT supported via EventKit

#### 5. Search & Filtering (Fully Supported via EventKit)
- **✅ Text Search** - Search by title, notes via NSPredicate
- **✅ Date Filters** - Due today, overdue, scheduled, completed
- **✅ Priority Filters** - Filter by priority level
- **✅ List Filters** - Filter by specific calendar/list
- **✅ Completion Filters** - Show completed, incomplete, or both
- **✅ Combined Filters** - Multiple criteria via NSPredicate
- **✅ Tag Filters** - Filter by tags (via workaround search in notes)

#### 6. Batch Operations (Fully Supported via EventKit)
- **✅ Bulk Create** - Create multiple reminders via EKEventStore batch commits
- **✅ Bulk Update** - Update multiple reminders efficiently
- **✅ Bulk Complete** - Mark multiple reminders as complete
- **✅ Bulk Delete** - Delete multiple reminders
- **✅ Batch Move** - Move reminders between lists/calendars

## MCP Tools Specification

### Design Philosophy
- **Fine-grained tools** - Each tool does one thing well
- **Descriptive naming** - Clear, action-oriented names (e.g., `create_reminder`, not `reminder`)
- **Comprehensive schemas** - Detailed parameter descriptions for AI discoverability
- **Consistent patterns** - Similar tools follow similar parameter structures

### Tool Categories

#### Reminder Management Tools
1. `create_reminder` - Create a new reminder with all attributes (including recurrence, location)
2. `get_reminder` - Get reminder by ID with full details
3. `update_reminder` - Update existing reminder attributes
4. `delete_reminder` - Delete a reminder
5. `complete_reminder` - Mark reminder as complete
6. `uncomplete_reminder` - Mark reminder as incomplete

#### List Management Tools
7. `create_list` - Create a new reminder list (calendar)
8. `get_list` - Get list details and optionally its reminders
9. `get_all_lists` - Get all reminder lists
10. `update_list` - Update list properties (name, color)
11. `delete_list` - Delete a list

#### Search & Query Tools
12. `search_reminders` - Search reminders with filters (NSPredicate-based)
13. `get_reminders_by_date` - Get reminders due on/before/after date
14. `get_reminders_by_tag` - Get reminders with specific tags (via notes search)
15. `get_completed_reminders` - Get completed reminders with date range
16. `get_overdue_reminders` - Get all overdue reminders
17. `get_todays_reminders` - Get reminders due today
18. `get_flagged_reminders` - Get all flagged reminders

#### Batch Operation Tools
19. `batch_create_reminders` - Create multiple reminders
20. `batch_update_reminders` - Update multiple reminders
21. `batch_complete_reminders` - Complete multiple reminders
22. `batch_delete_reminders` - Delete multiple reminders
23. `move_reminders_to_list` - Move multiple reminders to a list

#### Tag Management Tools (Workaround-based)
24. `get_all_tags` - Get all tags from notes field (via workaround)
25. `add_tags_to_reminder` - Add tags to notes field (via workaround)
26. `remove_tags_from_reminder` - Remove tags from notes field (via workaround)

#### Location-based Reminder Tools
27. `add_location_alert` - Add location-based trigger to reminder
28. `remove_location_alert` - Remove location trigger from reminder

### Example Tool Schema

```typescript
// Example: create_reminder tool
{
  name: "create_reminder",
  description: "Create a new reminder in Apple Reminders with comprehensive attributes including scheduling, tags, location, and alerts",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "The reminder title/name (required)"
      },
      notes: {
        type: "string",
        description: "Additional notes or description for the reminder"
      },
      listName: {
        type: "string",
        description: "Name of the list to add reminder to (defaults to default list)"
      },
      dueDate: {
        type: "string",
        description: "Due date in ISO 8601 format (e.g., '2024-12-31T14:00:00')"
      },
      priority: {
        type: "number",
        description: "Priority: 0 (none), 1-4 (low), 5 (medium), 6-9 (high)",
        minimum: 0,
        maximum: 9
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "Array of tag names to apply"
      },
      flagged: {
        type: "boolean",
        description: "Whether to flag this reminder"
      },
      // ... additional properties for recurrence, alerts, location, etc.
    },
    required: ["title"]
  }
}
```

## Error Handling Strategy

### Principles
1. **Strict Validation** - Validate all inputs before processing
2. **Fail Fast** - Return errors immediately with clear messages
3. **Detailed Context** - Include operation details, IDs, timestamps
4. **No Silent Failures** - Always inform caller of errors

### Error Categories

```typescript
enum ErrorCode {
  // Validation Errors (400-level)
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_DATE_FORMAT = "INVALID_DATE_FORMAT",
  INVALID_PRIORITY = "INVALID_PRIORITY",

  // Not Found Errors (404-level)
  REMINDER_NOT_FOUND = "REMINDER_NOT_FOUND",
  LIST_NOT_FOUND = "LIST_NOT_FOUND",
  TAG_NOT_FOUND = "TAG_NOT_FOUND",

  // Permission Errors (403-level)
  REMINDERS_ACCESS_DENIED = "REMINDERS_ACCESS_DENIED",
  EVENTKIT_ACCESS_DENIED = "EVENTKIT_ACCESS_DENIED",

  // System Errors (500-level)
  SWIFT_CLI_EXECUTION_FAILED = "SWIFT_CLI_EXECUTION_FAILED",
  EVENTKIT_ERROR = "EVENTKIT_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

interface MCPError {
  code: ErrorCode;
  message: string;
  details?: {
    field?: string;
    value?: any;
    reminderId?: string;
    listName?: string;
    operation?: string;
    timestamp?: string;
  };
}
```

### Error Response Format

```json
{
  "isError": true,
  "code": "REMINDER_NOT_FOUND",
  "message": "Reminder with ID 'x-apple-reminder://ABC123' not found",
  "details": {
    "reminderId": "x-apple-reminder://ABC123",
    "operation": "get_reminder",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Testing Strategy

### Unit Tests
- **Coverage Target**: 80%+ line coverage
- **Frameworks**: Vitest (TypeScript), XCTest (Swift)
- **Scope**:
  - Validation functions (Zod schemas)
  - Tool handler logic (with mocked Swift CLI)
  - Swift CLI unit tests (EventKit integration points)
  - Utility functions
  - Error handling paths

### Integration Tests
- **Frameworks**: Vitest (TypeScript), XCTest (Swift)
- **Scope**:
  - Actual Swift CLI execution against Apple Reminders
  - Full tool workflows (create → read → update → delete)
  - Cross-tool interactions (e.g., create list, add reminder to it)
  - EventKit permission handling
  - Recurring reminder creation and validation
  - Location-based reminder triggers
- **Requirements**:
  - Test list cleanup before/after tests
  - Isolated test data (prefix with "TEST_")
  - Idempotent test execution
  - EventKit authorization granted before tests

### Manual Testing
- **MCP Inspector** - Test individual tools during development
- **Claude Desktop** - End-to-end testing with natural language
- **Test Scenarios Document** - Curated list of test cases for regression

### Test Data Management
```typescript
// Example test fixture
const TEST_REMINDER = {
  title: "TEST_Sample_Reminder",
  notes: "This is a test reminder",
  priority: 5,
  tags: ["test", "sample"]
};

// Cleanup utility
async function cleanupTestData() {
  // Delete all reminders/lists starting with "TEST_"
}
```

## Development Workflow

### Recommended Workflow with Claude Code

This project will follow a **structured, agent-driven workflow** leveraging Claude Code's subagents:

#### Phase 1: Exploration & Understanding
1. **Explore Agent** - Map out the Apple Reminders capabilities
   - Research EventKit APIs and EKReminder capabilities
   - Understand data models and constraints
   - Document available operations and limitations

#### Phase 2: Planning
2. **Plan Agent** - Design implementation strategy
   - Design Swift CLI architecture with EventKit integration
   - Plan TypeScript executor layer and tool handlers
   - Define validation schemas
   - Identify dependencies and risks
   - Plan build and distribution strategy

#### Phase 3: Implementation
3. **Iterative Development**
   - Implement tools in logical groups (core → advanced → batch)
   - Test each tool as it's implemented
   - Use hot reload for rapid iteration
   - Commit working features incrementally

#### Phase 4: Testing & Validation
4. **Test Agent** - Ensure quality
   - Write unit tests for each tool
   - Create integration tests for workflows
   - Manual testing with Claude Desktop

#### Phase 5: Documentation
5. **Document** - Create comprehensive docs
   - API reference for each tool
   - Architecture documentation
   - Development guide
   - README with setup instructions

### Development Commands
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "vitest",
    "test:unit": "vitest unit",
    "test:integration": "vitest integration",
    "lint": "eslint src/",
    "format": "prettier --write src/",
    "type-check": "tsc --noEmit"
  }
}
```

### Git Workflow
- **Commit Early, Commit Often** - Commit working features as they're completed
- **Descriptive Messages** - Clear commit messages describing what was added/changed
- **Feature Branches** - Optional for experimental features
- **Tags** - Tag releases (v0.1.0, v0.2.0, etc.)

## Security & Privacy

### Principles
1. **Local-Only Processing** - All operations happen locally on macOS
2. **No External API Calls** - Except MCP protocol communication with client
3. **No Telemetry** - No usage data collection or reporting
4. **Sensitive Data Handling** - Reminders may contain personal information
5. **Permission Handling** - Respect macOS permission system for Reminders access

### Security Measures
- **Input Sanitization** - Prevent injection attacks in JXA scripts
- **Validation** - Strict type checking and validation (Zod)
- **No Credentials** - No API keys or tokens required
- **Sandboxed Execution** - JXA runs in macOS sandbox

### Privacy Guarantees
- All reminder data stays on user's device
- No cloud sync or external transmission (beyond MCP client)
- User controls which AI assistant has access via MCP configuration
- Logging should not expose sensitive reminder content in production

## Documentation Requirements

### 1. README.md
- Project overview and features
- Prerequisites (Node.js version, macOS version)
- Installation instructions
- Claude Desktop integration setup
- Quick start examples
- Troubleshooting common issues
- Contributing guidelines

### 2. Architecture Documentation (`docs/architecture.md`)
- System architecture diagram
- Component descriptions
- JXA integration details
- Data flow explanation
- Design decisions and rationale
- Technology choices

### 3. API Documentation (`docs/api/`)
- Individual markdown file for each tool
- Parameter descriptions with examples
- Return value specifications
- Error scenarios
- Usage examples with natural language and JSON

### 4. Development Guide (`docs/development.md`)
- Development environment setup
- Project structure explanation
- How to add a new tool
- Testing guidelines
- Debugging tips
- Code style guide
- Using Claude Code effectively for this project

## Dependencies

### Swift Dependencies
- **EventKit** - Apple's framework for calendar and reminder access (built-in to macOS)
- **Foundation** - Swift standard library (built-in)
- **Swift 5.9+** - Modern Swift language features

### TypeScript/Node.js Production Dependencies
```json
{
  "@modelcontextprotocol/sdk": "latest",
  "zod": "^3.x",
  "winston": "^3.x" // or "pino": "^8.x"
}
```

### TypeScript/Node.js Development Dependencies
```json
{
  "@types/node": "^20.x",
  "typescript": "^5.x",
  "tsx": "^4.x",
  "vitest": "^1.x",
  "eslint": "^8.x",
  "@typescript-eslint/eslint-plugin": "^6.x",
  "@typescript-eslint/parser": "^6.x",
  "prettier": "^3.x"
}
```

### Build Requirements
- **macOS 13.0+** - Required for EventKit reminder features
- **Xcode 15+** - Swift compiler and development tools
- **Node.js 18+** - TypeScript runtime
- **Swift Package Manager** - Dependency management and build

## Implementation Milestones

### Milestone 1: Foundation (MVP)
- Swift CLI setup with EventKit integration
- TypeScript MCP server setup with @modelcontextprotocol/sdk
- Swift CLI executor layer (child_process + JSON)
- Core tools: `create_reminder`, `get_reminder`, `update_reminder`, `delete_reminder`
- Basic list tools: `create_list`, `get_all_lists`
- Validation layer with Zod
- Build scripts for Swift CLI compilation
- Unit tests for core functionality
- README with basic setup instructions

### Milestone 2: Advanced Features
- Recurring reminder support (EKRecurrenceRule)
- Location-based reminders (EKStructuredLocation)
- Multiple alarms support (EKAlarm)
- Tag management tools (workaround via notes)
- Search and filter tools (NSPredicate)
- Integration tests
- API documentation

### Milestone 3: Batch Operations & Polish
- Batch operation tools
- Performance optimization (batch commits, caching)
- Comprehensive error handling
- EventKit permission handling
- Full test coverage (TypeScript + Swift)
- Complete documentation suite

### Milestone 4: Production Ready
- Pre-compiled Swift binaries for distribution
- Hot reload for development
- Detailed logging system
- Edge case handling
- Production deployment guide
- Example use cases and workflows
- Video demo or walkthrough

## Success Criteria

### Functional Requirements
- [ ] All ~28 MCP tools implemented and working
- [ ] Support for ~70% of Apple Reminders features (all EventKit-accessible features)
- [ ] Recurring reminders fully functional
- [ ] Location-based reminders fully functional
- [ ] Tag workaround via notes field working
- [ ] Successful integration with Claude Desktop
- [ ] Natural language commands correctly translated to tool calls

### Quality Requirements
- [ ] 80%+ test coverage (TypeScript unit + integration)
- [ ] Swift tests for EventKit integration
- [ ] All tests passing consistently
- [ ] TypeScript strict mode with no errors
- [ ] Swift builds without warnings
- [ ] No ESLint violations
- [ ] Clean, maintainable code structure

### Documentation Requirements
- [ ] Complete README with setup guide
- [ ] API documentation for all tools
- [ ] Architecture documentation
- [ ] Development guide

### User Experience
- [ ] Fast response times (< 2s for most operations)
- [ ] Clear, helpful error messages
- [ ] Intuitive tool naming and descriptions
- [ ] Works reliably with real-world reminder data

## Future Enhancements (Post-v1.0)

- **Resources**: Expose reminder lists as MCP resources for context
- **Prompts**: Pre-built prompts for common reminder workflows
- **Sampling**: Support for LLM-driven reminder suggestions
- **Webhooks/Notifications**: Real-time updates when reminders change
- **Export/Import**: Backup and restore reminder data
- **Templates**: Reminder templates for common use cases
- **Analytics**: Insights into reminder completion rates, patterns
- **Cross-Platform**: Investigate iCloud API for non-macOS access (long-term)

---

**Document Version**: 2.0 (EventKit + Swift)
**Last Updated**: 2026-01-03
**Status**: Ready for Implementation with EventKit
**Architecture**: Swift CLI + EventKit + TypeScript MCP Server
**Feature Coverage**: ~70% (all EventKit-accessible features)
