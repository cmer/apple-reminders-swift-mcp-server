# Apple Reminders MCP Server - Current State

**Date**: January 3, 2026
**Status**: Ready to begin EventKit + Swift implementation
**Context**: Fresh start after JXA POC and pivot decision

---

## Quick Summary

Building a comprehensive MCP server for Apple Reminders on macOS using **EventKit + Swift CLI** approach.

**Why EventKit over JXA**:
- ✅ Recurring reminders support (critical feature)
- ✅ Location-based reminders
- ✅ Better performance
- ✅ 70% feature coverage vs 60% with JXA

**What's still impossible**: Tags and subtasks (private Apple APIs)

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

## What We've Done

1. ✅ Created comprehensive specification (`spec.md`)
2. ✅ Completed JXA POC (validated integration works)
3. ✅ Researched EventKit capabilities thoroughly
4. ✅ Made architectural decision (EventKit + Swift)
5. ✅ Archived JXA work to `/archive/poc/`
6. ✅ Documented pivot rationale (`PIVOT.md`)

**Git history**: All decisions and research committed

---

## What's Next

### Immediate Tasks
1. Update `spec.md` for EventKit approach
2. Set up Swift Package Manager project (`swift-cli/`)
3. Set up Node.js/TypeScript project (`src/`)
4. Implement basic EventKit integration
5. Create first MCP tools (create, get, list reminders)

### Project Structure to Create

```
apple-reminders-mcp-server/
├── swift-cli/                    # Swift CLI (new)
│   ├── Package.swift
│   ├── Sources/
│   │   ├── main.swift
│   │   ├── ReminderManager.swift
│   │   └── Models/
│   └── Tests/
├── src/                          # TypeScript MCP Server (new)
│   ├── index.ts
│   ├── server.ts
│   ├── tools/
│   ├── executor/                # Swift CLI executor
│   ├── validation/
│   └── types/
├── package.json                  # (create)
├── tsconfig.json                 # (create)
└── README.md                     # (create)
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

## What to Ask Claude Code Next

**Recommended first question**:
> "I want to build an Apple Reminders MCP server using EventKit + Swift based on CURRENT_STATE.md. Let's start by:
> 1. Updating spec.md for EventKit approach
> 2. Setting up the Swift Package Manager project structure
> 3. Setting up the TypeScript/Node.js MCP server foundation
>
> Please use the Plan agent to design the implementation approach first."

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

**Ready to start fresh!** 🚀
