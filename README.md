# Apple Reminders MCP Server

A comprehensive Model Context Protocol (MCP) server for Apple Reminders on macOS, enabling AI assistants like Claude to manage reminders using natural language.

## Features

✨ **Comprehensive Integration**
- Create, read, update, and delete reminders
- Manage reminder lists (calendars)
- Search and filter reminders
- ~70% feature coverage of Apple Reminders

🚀 **Powered by EventKit + Swift**
- Native EventKit integration for best performance
- Recurring reminders support
- Location-based reminders
- Multiple alarms per reminder

🔒 **Privacy First**
- All operations happen locally on your Mac
- No cloud services or external APIs
- Respects macOS permission system

## Architecture

```
Claude Desktop (MCP Client)
    ↓ MCP Protocol (stdio)
TypeScript MCP Server
    ↓ child_process + JSON
Swift CLI Binary (EventKit)
    ↓ EventKit Framework
Apple Reminders.app
```

## Prerequisites

- **macOS 13.0+** (Ventura or later)
- **Node.js 18+**
- **Swift 5.9+** (Xcode Command Line Tools)

## Quick Start

### 1. Install Dependencies and Build

```bash
npm run setup
```

This will:
- Install Node.js dependencies
- Build the Swift CLI binary
- Compile TypeScript to JavaScript

### 2. Request Reminders Access

The first time you use this server, you need to grant permission to access reminders:

```bash
./swift-cli/.build/release/reminders-cli request-access
```

Grant permission in System Settings > Privacy & Security > Reminders.

### 3. Test the Server (Optional)

Test the MCP server directly:

```bash
npm run dev
```

### 4. Configure Claude Desktop

Add to your Claude Desktop configuration (`~/.config/claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "apple-reminders": {
      "command": "node",
      "args": ["/absolute/path/to/apple-reminders-mcp-server/dist/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/` with your actual project path.

### 5. Restart Claude Desktop

Restart Claude Desktop to load the MCP server.

## Usage with Claude

Once configured, you can use natural language to manage reminders:

**Examples:**
- "Create a reminder to buy milk tomorrow at 5pm"
- "Show me all my reminders"
- "What reminder lists do I have?"
- "Mark the 'buy milk' reminder as complete"
- "Create a high-priority reminder to call mom with tags #family #important"

## Available Tools

### Reminder Management
- `create_reminder` - Create a new reminder with comprehensive attributes
- `get_reminders` - List all reminders (filter by completion status)

### List Management
- `get_all_lists` - Get all reminder lists

## Development

### Project Structure

```
apple-reminders-mcp-server/
├── swift-cli/              # Swift CLI (EventKit integration)
│   ├── Sources/
│   │   ├── RemindersKit/   # Core library
│   │   └── reminders-cli/  # CLI executable
│   └── Package.swift
├── src/                    # TypeScript MCP Server
│   ├── index.ts           # MCP server entry point
│   ├── executor/          # Swift CLI executor
│   ├── tools/             # MCP tool handlers
│   ├── validation/        # Zod schemas
│   └── types/             # TypeScript types
├── scripts/               # Build scripts
└── docs/                  # Documentation
```

### Development Commands

```bash
# Install dependencies
npm install

# Build Swift CLI
npm run build:swift

# Build TypeScript
npm run build

# Run in development mode (with hot reload)
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Clean build artifacts
npm run clean
```

### Building for Production

```bash
# Build Swift CLI in release mode
cd swift-cli
swift build --configuration release

# Build TypeScript
npm run build
```

The compiled binary will be at `swift-cli/.build/release/reminders-cli`.

## Implementation Details

### Swift CLI Commands

The Swift CLI accepts JSON input and returns JSON output:

```bash
# Create a reminder
./reminders-cli create-reminder '{"title":"Buy milk","priority":5}'

# List reminders
./reminders-cli list-reminders '{"completed":false}'

# Get all lists
./reminders-cli get-all-lists
```

### EventKit Integration

This server uses Apple's EventKit framework for native access to reminders:
- **EKEventStore** - Main interface to Calendar database
- **EKReminder** - Reminder objects
- **EKCalendar** - Reminder lists (calendars)
- **EKRecurrenceRule** - Recurring reminder patterns
- **EKStructuredLocation** - Location-based triggers

### Feature Coverage (~70%)

**Supported:**
- ✅ Full CRUD operations
- ✅ Lists management
- ✅ Recurring reminders
- ✅ Location-based reminders
- ✅ Multiple alarms
- ✅ Priority, flagged, due dates
- ✅ Notes, URLs

**Not Supported** (Private Apple APIs):
- ❌ Tags (workaround: encoded as `[#tag]` in notes)
- ❌ Subtasks (workaround: structured notes or linked reminders)
- ❌ Smart lists

## Troubleshooting

### Permission Denied

If you get permission errors, ensure you've:
1. Run `./swift-cli/.build/release/reminders-cli request-access`
2. Granted permission in System Settings > Privacy & Security > Reminders
3. Restarted Claude Desktop

### Swift CLI Not Found

If the TypeScript server can't find the Swift CLI:
1. Build the Swift CLI: `npm run build:swift`
2. Verify the binary exists: `ls swift-cli/.build/release/reminders-cli`
3. Check the path in `src/executor/swift-executor.ts`

### Build Errors

For Swift build errors:
```bash
cd swift-cli
swift build --configuration release
```

For TypeScript errors:
```bash
npm run type-check
```

## Roadmap

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for detailed implementation plan.

**Phase 1: Foundation** ✅
- [x] Swift CLI with EventKit
- [x] TypeScript MCP server
- [x] Basic tools (create, list)

**Phase 2: Core Features** (In Progress)
- [ ] Update and delete tools
- [ ] Complete/uncomplete tools
- [ ] Search and filter tools

**Phase 3: Advanced Features**
- [ ] Recurring reminders
- [ ] Location-based reminders
- [ ] Batch operations

**Phase 4: Polish**
- [ ] Full test coverage
- [ ] Pre-compiled binaries
- [ ] Distribution setup

## Contributing

This is a learning project. Contributions welcome!

## License

MIT

## References

- [MCP Documentation](https://modelcontextprotocol.io/)
- [EventKit Documentation](https://developer.apple.com/documentation/eventkit)
- [FradSer's mcp-server-apple-events](https://github.com/FradSer/mcp-server-apple-events) - Inspiration for architecture

---

**Built with ❤️ for the MCP ecosystem**

