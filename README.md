# Apple Reminders MCP Server v0.2.0

A comprehensive Model Context Protocol (MCP) server for Apple Reminders on macOS, enabling AI assistants like Claude and Cursor AI to manage reminders using natural language.

## 🎉 What's New in v0.2.0

- ✅ **Full CRUD operations** (create, read, update, delete)
- ✅ **Recurring reminders** (daily, weekly, monthly, yearly patterns)
- ✅ **Location-based reminders** (geofence triggers for arriving/leaving)
- ✅ **Multiple alarms** per reminder (absolute & relative)
- ✅ **Search functionality** (text search in title and notes)
- ✅ **Date-based queries** (today, overdue, completed)
- ✅ **12 MCP tools** (up from 3 in v0.1.0)

## Features

✨ **Comprehensive Integration**

- Full CRUD on reminders (create, read, update, delete, complete)
- Search and filter reminders
- Date-based queries (today, overdue, completed)
- ~70% feature coverage of Apple Reminders

🚀 **Powered by EventKit + Swift**

- Native EventKit integration for best performance
- ✅ **Recurring reminders** (daily, weekly, monthly, custom)
- ✅ **Location-based reminders** (arrive/depart triggers)
- ✅ **Multiple alarms** per reminder
- ✅ **Tag workarounds** (encoded in notes)

🔒 **Privacy First**

- All operations happen locally on your Mac
- No cloud services or external APIs
- Respects macOS permission system

## Prerequisites

- **macOS 13.0+** (Ventura or later)
- **Node.js 18+**
- **Swift 5.9+** (Xcode Command Line Tools)

## Quick Start

### 1. Install & Build

```bash
# Clone or download this repository
cd apple-reminders-mcp-server

# Run setup (installs dependencies and builds everything)
npm run setup
```

### 2. Request Permissions

```bash
./swift-cli/.build/release/reminders-cli request-access
```

Grant permission in System Settings > Privacy & Security > Reminders.

### 3. Configure Your AI Assistant

#### For Claude Desktop

Edit `~/.config/claude/claude_desktop_config.json`:

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

#### For Cursor AI

Edit your Cursor MCP settings to add this server with the same configuration.

### 4. Restart Your AI Assistant

Restart Claude Desktop or Cursor to load the MCP server.

## Available Tools (12 Total)

### Reminder Management (6 tools)

1. **`create_reminder`** - Create reminders with comprehensive attributes
   - Basic: title, notes, due date, priority, tags, URL
   - Advanced: recurring patterns, location triggers, multiple alarms
2. **`update_reminder`** - Update existing reminders
3. **`delete_reminder`** - Permanently delete reminders
4. **`complete_reminder`** - Mark reminder as complete
5. **`uncomplete_reminder`** - Mark reminder as incomplete
6. **`get_reminders`** - List all reminders (filter by completion)

### List Management (1 tool)

7. **`get_all_lists`** - Get all reminder lists

### Search & Query (5 tools)

8. **`search_reminders`** - Search by text in title/notes
9. **`get_todays_reminders`** - Get reminders due today
10. **`get_overdue_reminders`** - Get past-due reminders
11. **`get_completed_reminders`** - Get completed reminders (optional date range)

## Usage Examples

### Basic Reminders

```
"Create a reminder to buy milk"
"Show me all my reminders"
"Mark the milk reminder as complete"
"Delete the milk reminder"
```

### Recurring Reminders

```
"Create a weekly reminder for team meeting every Monday at 10am"
"Set up a daily reminder to take medication at 8am"
"Create a monthly reminder on the 1st to pay rent"
```

### Location-Based Reminders

```
"Remind me to buy groceries when I arrive at the supermarket"
"Create a reminder to call mom when I leave work"
```

### Search & Filters

```
"Search for reminders about meetings"
"Show me today's reminders"
"What reminders are overdue?"
"Show me completed reminders from last week"
```

### Advanced Features

```
""Create an URGENT reminder with priority 1 to call the client"
"Create a high-priority reminder with tags #work #urgent""
"Set up a reminder with multiple alarms - 1 day before and 1 hour before"
"Create a reminder that repeats every other week"
```

## Architecture

```
AI Assistant (Claude/Cursor)
    ↓ MCP Protocol (stdio)
TypeScript MCP Server (Node.js)
    ↓ child_process + JSON
Swift CLI Binary (EventKit)
    ↓ EventKit Framework
Apple Reminders.app
```

### Why EventKit + Swift?

This project uses Apple's **EventKit framework** via a Swift CLI, rather than the simpler JXA (JavaScript for Automation) approach. Here's why:

**JXA Limitations** (POC tested and documented):

- ❌ No support for **recurring reminders** (daily, weekly, monthly patterns)
- ❌ No support for **location-based reminders** (geofencing)
- ❌ No access to **tags** (would require text workarounds)
- ❌ No support for **subtasks** (not exposed in API)
- ❌ **Multiple alarms** not accessible
- ❌ JXA is essentially abandoned by Apple (no updates since 2014)

**EventKit Advantages**:

- ✅ Full access to **70%+ of Reminders features** via official Apple API
- ✅ Native support for **recurring reminders** with complex rules
- ✅ Native support for **location triggers** (arrive/depart)
- ✅ Native support for **multiple alarms** per reminder
- ✅ **Actively maintained** by Apple with new macOS releases
- ✅ Better **performance** and **reliability**

**Trade-off**: EventKit requires Swift compilation, but the benefits far outweigh the minimal additional setup complexity. The Swift CLI is built once during installation and provides access to nearly all Reminders features that are publicly available.

## Feature Coverage (~70%)

### ✅ Fully Supported

- **Core Operations**: Create, read, update, delete, complete
- **Recurring Reminders**: Daily, weekly, monthly, yearly with custom rules
- **Location Reminders**: Geofence triggers (arriving/leaving)
- **Multiple Alarms**: Absolute (specific time) and relative (before due date)
- **Search**: Text search in title and notes
- **Date Queries**: Today, overdue, completed with date ranges
- **Lists**: Get all lists, specify list for reminders
- **Priority**: 0=none, 1=urgent (!!!), 5=medium, 9=low
- **Flagged Status**: Mark reminders as important (flag icon)
- **Notes & URLs**: Rich text notes, associated URLs

### ⚠️ Workarounds

- **Tags**: Encoded as `[#tag]` in notes field (searchable)
- **Subtasks**: Use structured notes or linked reminders

### ⚠️ API Limitations (Not Yet Available in EventKit)

- **Urgent Alarms** (macOS 26.2+): The new "Urgent" alarm feature is NOT exposed in EventKit API
  - Workaround: Use `priority: 1` + `flagged: true` + regular alarms
  - See `URGENT_FEATURE_STATUS.md` for details
- Apple has not announced when/if EventKit will support this feature

### ❌ Not Supported (Private Apple APIs)

- Native tags feature
- Subtasks feature
- Smart lists

## Development

### Project Structure

```
apple-reminders-mcp-server/
├── swift-cli/              # Swift CLI (EventKit integration)
│   ├── Sources/
│   │   ├── RemindersKit/   # Core library
│   │   │   ├── Models/     # Swift models
│   │   │   └── *.swift     # Managers
│   │   └── reminders-cli/  # CLI executable
│   └── Package.swift
├── src/                    # TypeScript MCP Server
│   ├── index.ts           # MCP server entry
│   ├── executor/          # Swift CLI executor
│   ├── tools/             # 12 MCP tool handlers
│   ├── validation/        # Zod schemas
│   └── types/             # TypeScript types
└── docs/                  # Documentation
```

### Development Commands

```bash
# Build everything
npm run build          # Build TypeScript
npm run build:swift    # Build Swift CLI

# Development mode
npm run dev            # Watch mode for TypeScript

# Testing
npm test               # Run tests
npm run lint           # Lint code
npm run format         # Format code

# Cleanup
npm run clean          # Remove build artifacts
```

### Building from Source

```bash
# Build Swift CLI (release mode)
cd swift-cli
swift build --configuration release

# Build TypeScript
cd ..
npm run build
```

## Testing

### Test Swift CLI Directly

```bash
# Create an urgent reminder (priority 1 = shows !!! in Reminders.app)
./swift-cli/.build/release/reminders-cli create-reminder '{"title":"URGENT: Fix bug","priority":1}'

# Create recurring reminder
./swift-cli/.build/release/reminders-cli create-reminder '{
  "title":"Weekly Meeting",
  "dueDate":"2026-01-13T10:00:00Z",
  "recurrence":{"frequency":"weekly","interval":1}
}'

# Search reminders
./swift-cli/.build/release/reminders-cli search-reminders '{"searchText":"meeting"}'

# Get today's reminders
./swift-cli/.build/release/reminders-cli get-todays-reminders
```

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Advanced Features

### Recurring Reminders

Create reminders that repeat on a schedule:

```typescript
{
  "title": "Weekly team sync",
  "dueDate": "2026-01-13T10:00:00Z",
  "recurrence": {
    "frequency": "weekly",    // daily, weekly, monthly, yearly
    "interval": 1,            // every N weeks
    "daysOfWeek": [2],        // Monday (1=Sunday, 7=Saturday)
    "endDate": "2026-12-31T00:00:00Z"  // optional
  }
}
```

### Location-Based Reminders

Trigger reminders based on location:

```typescript
{
  "title": "Buy groceries",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "radius": 100,           // meters
    "proximity": "enter",    // or "leave"
    "title": "Whole Foods"
  }
}
```

### Multiple Alarms

Add multiple notifications to a reminder:

```typescript
{
  "title": "Important meeting",
  "dueDate": "2026-01-15T14:00:00Z",
  "alarms": [
    {
      "type": "relative",
      "relativeOffset": -86400  // 1 day before (in seconds)
    },
    {
      "type": "absolute",
      "absoluteDate": "2026-01-15T13:00:00Z"  // 1 hour before
    }
  ]
}
```

## Troubleshooting

### Permission Denied

1. Run `./swift-cli/.build/release/reminders-cli request-access`
2. Grant permission in System Settings > Privacy & Security > Reminders
3. Restart your AI assistant

### Swift CLI Not Found

1. Build the Swift CLI: `npm run build:swift`
2. Verify: `ls swift-cli/.build/release/reminders-cli`

### Tool Not Working

1. Check Swift CLI directly with test JSON
2. Check MCP server logs in your AI assistant
3. Use MCP Inspector for isolated debugging

## Roadmap

### ✅ Completed

- [x] Full CRUD operations
- [x] Search and filters
- [x] Date-based queries
- [x] Recurring reminders
- [x] Location-based reminders
- [x] Multiple alarms

### 🔄 Future Enhancements

- [ ] List management (create, update, delete lists)
- [ ] Batch operations
- [ ] Rich error messages with suggestions
- [ ] Performance optimization
- [ ] Pre-compiled binaries for distribution
- [ ] npm package publication

## Contributing

This is a learning project. Contributions, issues, and feature requests are welcome!

## License

MIT

## References

- [MCP Documentation](https://modelcontextprotocol.io/)
- [EventKit Documentation](https://developer.apple.com/documentation/eventkit)
- [FradSer's mcp-server-apple-events](https://github.com/FradSer/mcp-server-apple-events)

---

**Built with ❤️ for the MCP ecosystem**

Version 0.2.0 | Updated January 2026
