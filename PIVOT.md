# Project Pivot: JXA → EventKit + Swift

**Date**: January 3, 2026
**Decision**: Pivot from JXA to EventKit + Swift for comprehensive feature coverage

---

## Why We Pivoted

### JXA Limitations (60% Coverage)
- ❌ No recurring reminders
- ❌ No location-based reminders
- ❌ No tags (private API)
- ❌ No subtasks (private API)
- ⚠️ Move operations broken
- ⚠️ List deletion unreliable

### EventKit Benefits (70% Coverage)
- ✅ Recurring reminders support
- ✅ Location-based reminders
- ✅ Better performance
- ✅ More stable API
- ❌ Still no tags (private API)
- ❌ Still no subtasks (private API)

**Net Gain**: +10% coverage, critical features (recurrence, location), better performance

---

## What We Learned from JXA POC

### Key Insights (Archived in `/archive/poc/`)
1. ✅ Validated Apple Reminders integration works
2. ✅ Confirmed Node.js bridge pattern (child_process + JSON)
3. ✅ Tested date filtering and search patterns
4. ✅ Identified all API limitations
5. ✅ Proved MCP server architecture is sound

### Patterns to Reuse
- **Executor Pattern**: Node.js → child_process → JSON response
- **Template Pattern**: Generate scripts from parameters
- **Error Handling**: Parse error codes and provide context
- **Testing Approach**: Unit + integration + manual testing

---

## New Architecture: EventKit + Swift

```
┌─────────────────────────────────────┐
│   MCP Client (Claude Desktop)      │
└──────────────┬──────────────────────┘
               │ MCP Protocol (stdio)
               ▼
┌─────────────────────────────────────┐
│   MCP Server (TypeScript/Node.js)   │
│   - Tool handlers                   │
│   - Validation (Zod)                │
│   - Error handling                  │
└──────────────┬──────────────────────┘
               │ child_process.execSync
               ▼
┌─────────────────────────────────────┐
│   Swift CLI Binary (compiled)       │
│   - EventKit integration            │
│   - JSON serialization              │
│   - Permission handling             │
└──────────────┬──────────────────────┘
               │ EventKit Framework
               ▼
┌─────────────────────────────────────┐
│   Apple Reminders.app (macOS)       │
└─────────────────────────────────────┘
```

---

## Project Structure (New)

```
apple-reminders-mcp-server/
├── swift-cli/                    # Swift CLI using EventKit
│   ├── Package.swift             # Swift Package Manager
│   ├── Sources/
│   │   ├── main.swift           # CLI entry point
│   │   ├── ReminderManager.swift
│   │   ├── ListManager.swift
│   │   └── Models/              # Data models
│   └── Tests/
├── src/                          # TypeScript MCP Server
│   ├── index.ts
│   ├── server.ts
│   ├── tools/                   # MCP tool handlers
│   ├── executor/                # Swift CLI executor
│   ├── validation/              # Zod schemas
│   └── types/
├── archive/                      # Archived JXA POC
│   └── poc/
├── docs/
├── package.json
├── tsconfig.json
└── README.md
```

---

## Revised Feature Scope (EventKit)

### Tier 1: Core (Essential) ✅
- Create, read, update, delete reminders
- Mark complete/incomplete
- List management (create, read, update)
- All basic properties (title, notes, dates, priority)

### Tier 2: Advanced (EventKit Unlocks) ✅
- **Recurring reminders** (daily, weekly, monthly, custom)
- **Location-based reminders** (arrive/depart triggers)
- Multiple alarms per reminder
- Shared reminders (attendees)

### Tier 3: Search & Filtering ✅
- Date-based queries
- Text search
- Priority filtering
- Completion status filtering

### Not Supported (Private APIs) ❌
- Tags (workaround: encode in body as `[#tag]`)
- Subtasks (workaround: notes with checkboxes or linked reminders)
- Smart lists (cannot create programmatically)

---

## Workarounds for Missing Features

### Tags Workaround
```typescript
// Tool: create_reminder
{
  "title": "Buy groceries",
  "notes": "[#shopping] [#urgent]\n\nMilk, eggs, bread",
  // ...
}

// Tool: search_reminders_by_tag
// Parse notes field for [#tag] patterns
```

### Subtasks Workaround (Option 1: Notes)
```typescript
{
  "title": "Complete project",
  "notes": "Subtasks:\n☐ Design mockups\n☐ Write code\n☐ Test\n☐ Deploy"
}
```

### Subtasks Workaround (Option 2: Linked Reminders)
```typescript
// Create parent reminder
const parent = await createReminder({
  title: "Complete project",
  notes: "Parent task"
});

// Create "child" reminders with reference
await createReminder({
  title: "Design mockups",
  notes: `Subtask of: ${parent.id}`
});
```

---

## Development Workflow (EventKit Approach)

### Phase 1: Swift CLI Development
1. Build Swift Package Manager project
2. Implement EventKit integration
3. Create JSON CLI interface
4. Test with sample data
5. Compile release binary

### Phase 2: Node.js MCP Server
1. Set up TypeScript project
2. Create Swift CLI executor
3. Implement MCP tool handlers
4. Add validation layer
5. Write tests

### Phase 3: Integration & Testing
1. Test MCP server with Claude Desktop
2. Integration tests
3. Error handling
4. Documentation
5. Distribution (pre-compiled binaries)

---

## Next Steps

1. ✅ Archive JXA POC work
2. ✅ Update spec.md for EventKit approach
3. 🔄 Set up Swift Package Manager project
4. 🔄 Build basic EventKit integration
5. 🔄 Create TypeScript MCP server foundation
6. 🔄 Implement first tools (create, get, list)
7. 🔄 Test with Claude Desktop

---

## References

- EventKit Documentation: https://developer.apple.com/documentation/eventkit
- Existing Implementation: https://github.com/FradSer/mcp-server-apple-events
- Swift Package Manager: https://swift.org/package-manager/

---

**Status**: Ready to proceed with EventKit + Swift implementation
**Expected Timeline**: 3-4 weeks to MVP
**Feature Coverage**: ~70% (vs 60% with JXA)
