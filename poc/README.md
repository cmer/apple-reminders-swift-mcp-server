# Apple Reminders JXA Proof-of-Concept Scripts

This directory contains POC scripts to validate JXA (JavaScript for Automation) capabilities for accessing Apple Reminders on macOS.

## Purpose

De-risk the technical unknowns before building the full MCP server by:
1. Testing JXA APIs and capabilities
2. Validating what works and what doesn't
3. Discovering limitations and gotchas
4. Establishing patterns for the Node.js bridge

## Scripts

### 01-basic-crud.js
**Tests**: Core CRUD operations (Create, Read, Update, Delete)

```bash
./poc/jxa-scripts/01-basic-crud.js
```

**What it validates**:
- Creating lists and reminders
- Reading reminder properties
- Updating reminders (name, body, priority, completion status)
- Deleting reminders
- Verifying operations succeed

**Expected outcome**: All CRUD operations work correctly, except list deletion.

---

### 02-list-operations.js
**Tests**: List management operations

```bash
./poc/jxa-scripts/02-list-operations.js
```

**What it validates**:
- Getting all lists
- Creating new lists
- Accessing lists by name and ID
- Getting default list and account
- Testing list deletion (confirms it fails)

**Expected outcome**: List reading/creation works; deletion fails as documented.

---

### 03-date-filtering.js
**Tests**: Date-based queries and filtering

```bash
./poc/jxa-scripts/03-date-filtering.js
```

**What it validates**:
- Creating reminders with various due dates
- Filtering by completion status
- Filtering by priority
- Date comparisons (before/after)
- Complex filters with AND conditions
- Performance with `.properties()` vs individual calls

**Expected outcome**: Date filtering and whose() clauses work well.

---

### 04-limitations-test.js
**Tests**: Features that DON'T work in JXA

```bash
./poc/jxa-scripts/04-limitations-test.js
```

**What it validates (confirms failures)**:
- Tags - NOT accessible
- Recurrence rules - NOT programmable
- Location-based reminders - NOT supported
- Subtasks - NOT exposed in API
- Move operations - BROKEN
- List deletion - NOT supported
- Attachments - LIMITED support

**Expected outcome**: Confirms all documented limitations are real.

---

### 05-nodejs-bridge.js
**Tests**: Node.js to JXA bridge using child_process

```bash
node poc/jxa-scripts/05-nodejs-bridge.js
```

**What it validates**:
- Executing JXA from Node.js
- Passing data via JSON
- Error handling across the bridge
- All JXA operations work from Node.js

**Expected outcome**: Demonstrates how the MCP server will execute JXA scripts.

---

## Running the Tests

### Prerequisites
- macOS (10.14+)
- Node.js (for script 05)
- Apple Reminders app installed
- Permissions granted for Terminal/Node.js to access Reminders

### Run All JXA Scripts
```bash
# Individual scripts
./poc/jxa-scripts/01-basic-crud.js
./poc/jxa-scripts/02-list-operations.js
./poc/jxa-scripts/03-date-filtering.js
./poc/jxa-scripts/04-limitations-test.js

# Node.js bridge
node poc/jxa-scripts/05-nodejs-bridge.js
```

### Cleanup Test Data
The scripts create test lists with "POC_" prefix. They will need to be deleted manually from the Reminders app since JXA doesn't support list deletion.

Test lists created:
- `POC_Test_List`
- `POC_Advanced_List`
- `POC_Date_Test`
- `POC_Limitations_Test`
- `POC_NodeJS_Test`

## Key Findings

### ✅ What Works
- **Basic CRUD**: Create, read, update, delete reminders
- **List Management**: Create, read lists (but not delete)
- **Core Properties**: name, body, dueDate, priority, completed, remindMeDate
- **Date Filtering**: whose() clauses with date comparisons
- **Complex Queries**: AND/OR filters
- **Node.js Bridge**: Execute JXA from Node.js via child_process

### ❌ What Doesn't Work
- **Tags**: Not exposed in JXA API
- **Recurrence**: Cannot set recurring rules
- **Location**: No geolocation support
- **Subtasks**: Not accessible despite UI support
- **Move Operations**: Broken, can cause data loss
- **List Deletion**: Not supported
- **Smart Lists**: Cannot be created programmatically

### ⚠️ Limitations & Gotchas
1. **Performance**: Use `.properties()` for batch property access
2. **Date Handling**: JavaScript months are 0-indexed
3. **List Deletion**: Must be done manually in the UI
4. **Move Operations**: Avoid entirely - they're broken
5. **JXA is Abandoned**: No new features, bugs won't be fixed

## Workarounds for Limitations

### Tags
Encode in body text:
```javascript
reminder.body = "[#work][#urgent] Complete quarterly review";
```

### Recurrence
Create individual instances manually or track separately

### Subtasks
Use flat structure or encode in notes:
```javascript
reminder.body = "Main task\n  - Subtask 1\n  - Subtask 2";
```

### URLs
Embed directly in body text (they'll be clickable in the UI)

## Impact on MCP Server Design

Based on these POC results, the MCP server should:

1. **Not expose unsupported features** as tools:
   - No `add_tags` or `create_recurring_reminder` tools
   - No `create_smart_list` or `delete_list` tools
   - No `add_subtask` or `set_location_reminder` tools

2. **Document workarounds** in tool descriptions:
   - Suggest encoding tags in body text
   - Explain why recurring reminders aren't supported

3. **Focus on what works well**:
   - Robust CRUD for reminders
   - Powerful filtering and search
   - Date-based queries
   - Priority and completion management

4. **Update specification** to reflect realistic scope:
   - Reduce from "comprehensive" to "extended core features"
   - Be transparent about JXA limitations

## Next Steps

After validating these POC scripts:
1. Update `spec.md` to reflect discovered limitations
2. Revise MCP tool list to remove unsupported features
3. Proceed with Option A: Foundation setup
4. Build Node.js MCP server using patterns from script 05
5. Create JXA bridge layer based on successful patterns

## Questions & Decisions

### Should we proceed with JXA despite limitations?

**Recommendation: YES**

**Reasons**:
- Core CRUD operations work reliably
- Sufficient for 80% of common use cases
- No external dependencies or compilation needed
- Good for AI assistant integration (main use case)
- Can always migrate to EventKit later if needed

**Trade-offs accepted**:
- No tags (can workaround with text encoding)
- No recurring reminders (acceptable limitation)
- No subtasks (flat structure is acceptable)
- Cannot delete lists programmatically (minor issue)

### Alternative: EventKit via Swift Helper

If limitations become blockers, we could:
1. Write a Swift CLI using EventKit framework
2. Call it from Node.js like we call osascript
3. Get full access to all features

**Trade-off**: Adds build complexity (Swift compilation step)

**Decision**: Proceed with JXA for MVP; revisit if needed.
