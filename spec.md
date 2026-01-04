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
- **JXA (JavaScript for Automation)** - Primary integration method
  - Native TypeScript/JavaScript integration
  - Direct AppleScript bridge without compilation
  - Access to Reminders.app via macOS scripting APIs
  - No additional language runtime required

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
│  │  Business Logic Layer        │  │
│  └───────────┬──────────────────┘  │
│              │                      │
│  ┌───────────▼──────────────────┐  │
│  │  JXA Bridge Layer            │  │
│  └───────────┬──────────────────┘  │
└──────────────┼──────────────────────┘
               │ JXA/OSA Runtime
               │
┌──────────────▼──────────────────────┐
│   Apple Reminders.app (macOS)       │
└─────────────────────────────────────┘
```

### Project Structure

```
apple-reminders-mcp-server/
├── src/
│   ├── index.ts                 # MCP server entry point
│   ├── server.ts                # MCP server setup and configuration
│   ├── tools/                   # MCP tool handlers
│   │   ├── reminders/          # Reminder CRUD operations
│   │   ├── lists/              # List management operations
│   │   ├── search/             # Search and filter operations
│   │   └── batch/              # Batch operations
│   ├── jxa/                    # JXA bridge layer
│   │   ├── runner.ts           # JXA script executor
│   │   ├── scripts/            # JXA script templates
│   │   └── types.ts            # TypeScript types for JXA objects
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

### Comprehensive Apple Reminders Feature Coverage

#### 1. Core Reminder Attributes
- **Title** (required) - Reminder name/description
- **Notes** - Rich text notes (Markdown-compatible)
- **Completion Status** - Completed vs incomplete
- **Priority** - None, Low, Medium, High (0-9 in macOS)
- **Due Date** - Optional date/time when reminder is due
- **Tags** - Multiple tags for organization
- **URLs** - Associated web links
- **Flagged Status** - Mark as flagged for importance

#### 2. Advanced Scheduling
- **Recurring Reminders** - Daily, weekly, monthly, yearly, custom intervals
- **End Repeat** - Never, on date, after N occurrences
- **Early Reminders/Alerts** - Notify before due date (e.g., 1 day before)
- **Multiple Alerts** - Support for multiple notification times
- **Time-of-Day Reminders** - Specific time vs all-day
- **Custom Repeat Rules** - Every N days/weeks/months, specific days of week

#### 3. Organization
- **Lists** - Organize reminders into lists
- **Smart Lists** - Dynamic lists based on criteria (today, scheduled, flagged, etc.)
- **List Groups** - Organize lists into groups
- **Subtasks (Sub-reminders)** - Hierarchical task breakdown
- **List Colors/Icons** - Visual customization
- **Default List** - Set default list for new reminders

#### 4. Location & Context
- **Location-based Reminders** - Trigger at arrival/departure from location
- **Geofence Radius** - Customizable proximity trigger
- **Attachments/Images** - Associate images and files (if supported via JXA)
- **Contact Association** - Link reminders to contacts

#### 5. Search & Filtering
- **Text Search** - Search by title, notes, tags
- **Date Filters** - Due today, overdue, scheduled, completed
- **Priority Filters** - Filter by priority level
- **Tag Filters** - Filter by one or multiple tags
- **List Filters** - Filter by specific list
- **Completion Filters** - Show completed, incomplete, or both
- **Combined Filters** - Multiple criteria simultaneously

#### 6. Batch Operations
- **Bulk Create** - Create multiple reminders at once
- **Bulk Update** - Update multiple reminders (e.g., change list, add tag)
- **Bulk Complete** - Mark multiple reminders as complete
- **Bulk Delete** - Delete multiple reminders
- **Batch Move** - Move reminders between lists

## MCP Tools Specification

### Design Philosophy
- **Fine-grained tools** - Each tool does one thing well
- **Descriptive naming** - Clear, action-oriented names (e.g., `create_reminder`, not `reminder`)
- **Comprehensive schemas** - Detailed parameter descriptions for AI discoverability
- **Consistent patterns** - Similar tools follow similar parameter structures

### Tool Categories

#### Reminder Management Tools
1. `create_reminder` - Create a new reminder with all attributes
2. `get_reminder` - Get reminder by ID with full details
3. `update_reminder` - Update existing reminder attributes
4. `delete_reminder` - Delete a reminder
5. `complete_reminder` - Mark reminder as complete
6. `uncomplete_reminder` - Mark reminder as incomplete
7. `add_subtask` - Add a sub-reminder to a reminder
8. `remove_subtask` - Remove a sub-reminder

#### List Management Tools
9. `create_list` - Create a new reminder list
10. `get_list` - Get list details and optionally its reminders
11. `get_all_lists` - Get all reminder lists
12. `update_list` - Update list properties (name, color, icon)
13. `delete_list` - Delete a list
14. `create_smart_list` - Create a smart list with criteria
15. `get_list_groups` - Get all list groups

#### Search & Query Tools
16. `search_reminders` - Search reminders with filters
17. `get_reminders_by_date` - Get reminders due on/before/after date
18. `get_reminders_by_tag` - Get reminders with specific tags
19. `get_completed_reminders` - Get completed reminders with date range
20. `get_overdue_reminders` - Get all overdue reminders
21. `get_todays_reminders` - Get reminders due today
22. `get_flagged_reminders` - Get all flagged reminders

#### Batch Operation Tools
23. `batch_create_reminders` - Create multiple reminders
24. `batch_update_reminders` - Update multiple reminders
25. `batch_complete_reminders` - Complete multiple reminders
26. `batch_delete_reminders` - Delete multiple reminders
27. `move_reminders_to_list` - Move multiple reminders to a list

#### Tag Management Tools
28. `get_all_tags` - Get all tags used across reminders
29. `add_tags_to_reminder` - Add tags to a reminder
30. `remove_tags_from_reminder` - Remove tags from a reminder

#### Recurring Reminder Tools
31. `create_recurring_reminder` - Create reminder with recurrence rule
32. `update_recurrence_rule` - Update recurrence pattern
33. `remove_recurrence` - Convert recurring reminder to one-time

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

  // System Errors (500-level)
  JXA_EXECUTION_FAILED = "JXA_EXECUTION_FAILED",
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
- **Framework**: Vitest
- **Scope**:
  - Validation functions (Zod schemas)
  - Tool handler logic (with mocked JXA)
  - Utility functions
  - Error handling paths

### Integration Tests
- **Framework**: Vitest
- **Scope**:
  - Actual JXA execution against Apple Reminders
  - Full tool workflows (create → read → update → delete)
  - Cross-tool interactions (e.g., create list, add reminder to it)
- **Requirements**:
  - Test list cleanup before/after tests
  - Isolated test data (prefix with "TEST_")
  - Idempotent test execution

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
   - Research JXA APIs for Reminders.app
   - Understand data models and constraints
   - Document available operations and limitations

#### Phase 2: Planning
2. **Plan Agent** - Design implementation strategy
   - Design JXA bridge architecture
   - Plan tool handler structure
   - Define validation schemas
   - Identify dependencies and risks

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

### Production Dependencies
```json
{
  "@modelcontextprotocol/sdk": "latest",
  "zod": "^3.x",
  "winston": "^3.x" // or "pino": "^8.x"
}
```

### Development Dependencies
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

## Implementation Milestones

### Milestone 1: Foundation (MVP)
- Project setup with TypeScript, MCP SDK, and build tools
- JXA bridge layer with basic Reminders.app access
- Core tools: `create_reminder`, `get_reminder`, `update_reminder`, `delete_reminder`
- Basic list tools: `create_list`, `get_all_lists`
- Validation layer with Zod
- Unit tests for core functionality
- README with basic setup instructions

### Milestone 2: Advanced Features
- Advanced scheduling tools (recurring reminders, alerts)
- Subtask/sub-reminder support
- Tag management tools
- Search and filter tools
- Smart list support
- Integration tests
- API documentation

### Milestone 3: Batch Operations & Polish
- Batch operation tools
- Location-based reminders
- Performance optimization (caching, batching)
- Comprehensive error handling
- Full test coverage
- Complete documentation suite

### Milestone 4: Production Ready
- Hot reload for development
- Detailed logging system
- Edge case handling
- Production deployment guide
- Example use cases and workflows
- Video demo or walkthrough

## Success Criteria

### Functional Requirements
- [ ] All 30+ MCP tools implemented and working
- [ ] Support for all Apple Reminders features mentioned in specification
- [ ] Successful integration with Claude Desktop
- [ ] Natural language commands correctly translated to tool calls

### Quality Requirements
- [ ] 80%+ test coverage (unit + integration)
- [ ] All tests passing consistently
- [ ] TypeScript strict mode with no errors
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

**Document Version**: 1.0
**Last Updated**: 2024-01-15
**Status**: Ready for Implementation
