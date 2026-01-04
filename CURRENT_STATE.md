# Apple Reminders MCP Server - Current State

**Date**: January 4, 2026  
**Status**: ✅ Foundation Complete - Ready for Testing & Extension  
**Last Updated**: End of implementation session

---

## Quick Summary

✅ **Successfully built** a comprehensive MCP server for Apple Reminders on macOS using **EventKit + Swift CLI** approach.

**What's Working**:
- ✅ Swift CLI with EventKit integration (builds and runs)
- ✅ TypeScript MCP server with 3 working tools
- ✅ End-to-end integration validated (creates real reminders!)
- ✅ Build scripts and development workflow
- ✅ Comprehensive documentation

**What's Next**: Test with Claude Desktop, implement more tools (update, delete, search)

---

## Project Goals

1. **Comprehensive MCP server** exposing Apple Reminders to AI assistants
2. **Primary use case**: Claude integration via natural language
3. **Target users**: Developers and power users on macOS
4. **Feature coverage**: ~70% of Apple Reminders features

---

## Architecture Decision

```
TypeScript MCP Server
    ↓ (child_process + JSON)
Swift CLI Binary (EventKit)
    ↓
Apple Reminders
```

**Pattern**: Same as successful [mcp-server-apple-events](https://github.com/FradSer/mcp-server-apple-events)

---

## What We've Built

### Completed ✅

1. ✅ Swift Package Manager project (`swift-cli/`)
   - EventKit integration with ReminderManager and ListManager
   - JSON-based CLI interface
   - 5 commands: request-access, create-reminder, get-reminder, list-reminders, get-all-lists

2. ✅ TypeScript MCP Server (`src/`)
   - MCP server with @modelcontextprotocol/sdk
   - Swift CLI executor layer
   - Validation with Zod
   - 3 MCP tools: create_reminder, get_reminders, get_all_lists

3. ✅ Build Scripts & Workflow
   - setup.sh, build-swift-cli.sh, clean.sh
   - npm scripts for development
   - .gitignore and project config

4. ✅ Documentation
   - README.md (comprehensive project docs)
   - IMPLEMENTATION_PLAN.md (detailed plan)
   - TESTING_GUIDE.md (Claude Desktop testing)
   - BUILD_SUMMARY.md (what we built)

### Validated ✅

- Swift CLI creates reminders in Apple Reminders.app
- JSON input/output works correctly
- EventKit permissions work
- TypeScript builds without errors
- End-to-end architecture proven

---

## What's Next

### Immediate (You can do now!)
1. **Test with Claude Desktop** (5 minutes)
   - Configure Claude Desktop (see TESTING_GUIDE.md)
   - Test creating reminders with natural language
   - Verify it works end-to-end

### Phase 2: Core Tools (1-2 hours)
2. **Implement CRUD tools**:
   - update_reminder
   - delete_reminder
   - complete_reminder / uncomplete_reminder

3. **Implement search tools**:
   - search_reminders
   - get_todays_reminders
   - get_overdue_reminders

### Phase 3: Advanced Features (3-4 hours)
4. **Recurring reminders** (EKRecurrenceRule)
5. **Location-based reminders** (EKStructuredLocation)
6. **Batch operations**

### Phase 4: Polish (3-4 hours)
7. **Testing** (unit + integration)
8. **Pre-compiled binaries**
9. **Distribution**

### Current Project Structure

```
apple-reminders-mcp-server/
├── swift-cli/                    # ✅ Swift CLI (built)
│   ├── Package.swift
│   ├── Sources/
│   │   ├── RemindersKit/        # Core library
│   │   └── reminders-cli/       # CLI executable
│   └── .build/release/          # Compiled binary
├── src/                          # ✅ TypeScript MCP Server
│   ├── index.ts                 # MCP server entry
│   ├── executor/                # Swift CLI executor
│   ├── tools/                   # Tool handlers
│   ├── validation/              # Zod schemas
│   └── types/                   # TypeScript types
├── dist/                         # ✅ Compiled JavaScript
├── scripts/                      # ✅ Build scripts
├── docs/                         # ✅ Documentation
├── package.json                  # ✅ Node.js config
├── tsconfig.json                 # ✅ TypeScript config
├── README.md                     # ✅ Project docs
├── IMPLEMENTATION_PLAN.md        # ✅ Implementation plan
├── TESTING_GUIDE.md              # ✅ Testing guide
└── BUILD_SUMMARY.md              # ✅ Build summary
```

---

## Key Technical Details

### EventKit Features We Can Use
- ✅ Full CRUD on reminders
- ✅ List management
- ✅ Recurring reminders (daily, weekly, monthly, custom rules)
- ✅ Location-based reminders (geofence triggers)
- ✅ Multiple alarms per reminder
- ✅ Priority, completion, flagged status
- ✅ Due dates, all-day dates
- ✅ Shared reminders

### Workarounds for Missing Features
- **Tags**: Encode as `[#tag]` in notes field + search
- **Subtasks**: Option 1: Notes with checkboxes; Option 2: Linked reminders

### Tech Stack
- **Swift 5.9+** with EventKit framework
- **Node.js 18+** with TypeScript
- **MCP SDK** (@modelcontextprotocol/sdk)
- **Zod** for validation
- **Vitest** for testing

---

## Development Approach

### Phase 1: Foundation (Week 1)
1. Swift CLI basics (hello world, EventKit connection)
2. TypeScript MCP server setup
3. Executor pattern (Node → Swift CLI)
4. First tool: `create_reminder`

### Phase 2: Core Tools (Week 2)
5. CRUD operations (get, update, delete)
6. List management
7. Search and filtering
8. Testing framework

### Phase 3: Advanced (Week 3)
9. Recurring reminders
10. Location-based reminders
11. Batch operations
12. Error handling polish

### Phase 4: Polish (Week 4)
13. Full test coverage
14. Documentation
15. Pre-compiled binaries
16. Distribution setup

---

## Reference Implementation

**FradSer's mcp-server-apple-events**: https://github.com/FradSer/mcp-server-apple-events
- Study this for patterns
- Similar architecture (Swift CLI + TypeScript)
- Pre-compiled binary distribution
- Permission handling

---

## Important Files

1. **spec.md** - Original comprehensive specification (needs EventKit update)
2. **PIVOT.md** - Explains why we chose EventKit over JXA
3. **archive/poc/** - JXA POC work (for reference, shows integration works)

---

## How to Continue

**Option 1: Test with Claude Desktop** (Recommended first step)
```
Follow TESTING_GUIDE.md to:
1. Configure Claude Desktop
2. Test create_reminder with natural language
3. Verify it works end-to-end
```

**Option 2: Implement More Tools** (Extend functionality)
```
Ask: "Let's implement the update_reminder and delete_reminder tools.
Follow the same pattern as create_reminder:
1. Add Swift commands to CommandRouter
2. Create TypeScript tool handlers
3. Test with Swift CLI first, then with Claude Desktop"
```

**Option 3: Add Advanced Features** (Recurring/Location)
```
Ask: "Let's add recurring reminder support using EKRecurrenceRule.
1. Research EKRecurrenceRule patterns
2. Update Swift models and manager
3. Add recurrence schema to TypeScript
4. Test creating a weekly recurring reminder"
```

---

## Tips for New Session

1. **Use subagents effectively**:
   - **Plan agent**: Before implementing each major feature
   - **Explore agent**: When researching Swift/EventKit patterns

2. **Commit frequently**: After each working feature

3. **Test incrementally**: Don't build everything before testing

4. **Reference FradSer's implementation** when stuck

5. **Keep scope realistic**: 70% coverage is great, don't chase the impossible 30%

---

---

## Quick Commands

```bash
# Test Swift CLI directly
./swift-cli/.build/release/reminders-cli request-access
./swift-cli/.build/release/reminders-cli create-reminder '{"title":"Test"}'

# Build everything
npm run build:swift
npm run build

# Run in development mode
npm run dev

# Clean and rebuild
npm run clean
npm run setup
```

---

**Status**: 🚀 **Foundation Complete - Ready to Test and Extend!**

All TODOs completed, architecture validated, documentation comprehensive.  
Next step: Test with Claude Desktop or implement more tools!
