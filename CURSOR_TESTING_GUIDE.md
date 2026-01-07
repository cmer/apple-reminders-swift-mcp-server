# Testing with Cursor AI MCP - v0.2.0

## 🎯 Testing Comprehensive Feature Set

You now have **12 MCP tools** ready to test with Cursor AI!

---

## Setup (5 minutes)

### 1. Get Your Project Path

```bash
cd /Users/krishnadesiraju/apple-reminders-mcp-server
pwd
```

Copy this absolute path.

### 2. Configure Cursor AI MCP

Add to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "apple-reminders": {
      "command": "node",
      "args": ["/Users/krishnadesiraju/apple-reminders-mcp-server/dist/index.js"]
    }
  }
}
```

### 3. Restart Cursor

Completely restart Cursor to load the MCP server.

### 4. Verify Connection

You should see the MCP server connected with **12 tools** available.

---

## 🧪 Test Scenarios

### Phase 1: Basic CRUD (5 minutes)

**Test 1: Create Simple Reminder**
```
"Create a reminder to finish the quarterly report by Friday"
```
Expected: ✅ Creates reminder, shows ID and list

**Test 2: List Reminders**
```
"Show me all my reminders"
```
Expected: Lists all incomplete reminders

**Test 3: Update Reminder**
```
"Update the quarterly report reminder to high priority"
```
Expected: ✅ Updates priority, confirms change

**Test 4: Complete Reminder**
```
"Mark the quarterly report reminder as complete"
```
Expected: ✅ Sets completion status

**Test 5: Delete Reminder**
```
"Delete the quarterly report reminder"
```
Expected: ✅ Permanently removes reminder

---

### Phase 2: Recurring Reminders (10 minutes)

**Test 6: Daily Recurring**
```
"Create a daily reminder to take vitamins at 9am"
```
Expected: ✅ Creates reminder with daily recurrence, shows repeat icon in Reminders.app

**Test 7: Weekly Recurring**
```
"Set up a weekly reminder for Monday team meetings at 10am starting next Monday"
```
Expected: ✅ Creates weekly reminder on Mondays

**Test 8: Bi-Weekly Recurring**
```
"Create a reminder that repeats every 2 weeks for sprint planning"
```
Expected: ✅ Creates reminder with interval=2

**Test 9: Monthly Recurring**
```
"Set up a monthly reminder on the 15th to review finances"
```
Expected: ✅ Creates monthly reminder on specific day

**Test 10: Verify in Reminders.app**
- Open Apple Reminders.app
- Find the recurring reminders
- Verify they show repeat icons and correct schedules

---

### Phase 3: Location-Based Reminders (10 minutes)

**Test 11: Arrival Trigger**
```
"Remind me to buy groceries when I arrive at Whole Foods"
```
Expected: ✅ Creates reminder with location trigger (if Cursor can geocode)

**Test 12: Departure Trigger**
```
"Create a reminder to call John when I leave the office"
```
Expected: ✅ Creates reminder with departure trigger

**Test 13: Manual Location**
```
"Create a reminder with location trigger at latitude 37.7749, longitude -122.4194, radius 100 meters"
```
Expected: ✅ Creates reminder with specified coordinates

**Note**: Test actual geofence triggering by:
1. Enable location services for Reminders
2. Visit the location
3. Check if reminder triggers

---

### Phase 4: Multiple Alarms (5 minutes)

**Test 14: Multiple Time Alarms**
```
"Create a reminder for the big presentation with alarms 1 day before and 1 hour before"
```
Expected: ✅ Creates reminder with 2 alarms

**Test 15: Absolute Alarm**
```
"Set up a reminder for January 20th at 2pm with an alarm at 1pm"
```
Expected: ✅ Creates reminder with absolute alarm

---

### Phase 5: Search & Filters (10 minutes)

**Test 16: Text Search**
```
"Search for reminders about meetings"
```
Expected: Returns all reminders with "meeting" in title or notes

**Test 17: Today's Reminders**
```
"What reminders do I have today?"
```
Expected: Lists reminders due today (or empty if none)

**Test 18: Overdue Reminders**
```
"Show me overdue reminders"
```
Expected: Lists past-due incomplete reminders

**Test 19: Completed Reminders**
```
"Show me reminders I completed this week"
```
Expected: Lists recently completed reminders

**Test 20: Search with Filter**
```
"Search for incomplete reminders about work"
```
Expected: Searches incomplete reminders only

---

### Phase 6: Complex Scenarios (15 minutes)

**Test 21: Full-Featured Reminder**
```
"Create a high-priority reminder titled 'Client Meeting Prep' with tags #work #urgent, due January 20th at 2pm, that repeats weekly, with notes 'Review Q4 results and prepare slides', and alarms 1 day before and 1 hour before"
```
Expected: ✅ Creates comprehensive reminder with all features

**Test 22: Update Multiple Fields**
```
"Update the Client Meeting Prep reminder: change priority to medium, add tag #quarterly, and move due date to January 22nd"
```
Expected: ✅ Updates multiple fields

**Test 23: List Management**
```
"What reminder lists do I have?"
```
Expected: Shows all lists with IDs

**Test 24: Create in Specific List**
```
"Create a reminder 'Buy milk' in my Groceries list"
```
Expected: ✅ Creates reminder in specified list

**Test 25: Batch Workflow**
```
Create these reminders:
1. Daily standup at 9:30am (recurring daily)
2. Code review deadline Friday 5pm
3. Deploy to production (high priority, tags #devops #critical)
```
Expected: ✅ Creates all 3 reminders with correct attributes

---

## 📊 Success Criteria

### Must Work (Critical)
- [ ] Create basic reminder
- [ ] List reminders
- [ ] Update reminder
- [ ] Complete reminder
- [ ] Delete reminder
- [ ] Search reminders
- [ ] Create recurring reminder (weekly)
- [ ] Verify recurring reminder in Reminders.app

### Should Work (Important)
- [ ] Today's reminders query
- [ ] Overdue reminders query
- [ ] Completed reminders query
- [ ] Create reminder in specific list
- [ ] High priority reminders
- [ ] Tags in notes (searchable)
- [ ] Multiple alarms
- [ ] Different recurrence patterns (daily, monthly)

### Nice to Have (Optional)
- [ ] Location-based reminders (needs geocoding)
- [ ] Complex multi-field updates
- [ ] Bi-weekly/custom interval recurrence
- [ ] Search with completion filter

---

## 🐛 Debugging Tips

### If Tool Not Found
1. Check MCP server logs in Cursor
2. Verify server is running: Look for "Apple Reminders MCP Server v0.2.0"
3. Check tool registration: Should show "Available tools: 12"

### If Permission Errors
```bash
./swift-cli/.build/release/reminders-cli request-access
```
Then restart Cursor.

### If Recurring Reminder Fails
- Error: "A repeating reminder must have a due date"
- Solution: Always include `dueDate` when using `recurrence`

### If Location Reminder Fails
- May need explicit latitude/longitude
- Cursor's geocoding capabilities vary
- Can test with manual coordinates

### Test Swift CLI Directly
```bash
# Test recurring
./swift-cli/.build/release/reminders-cli create-reminder '{
  "title":"Test Weekly",
  "dueDate":"2026-01-13T10:00:00Z",
  "recurrence":{"frequency":"weekly","interval":1}
}'

# Test search
./swift-cli/.build/release/reminders-cli search-reminders '{"searchText":"test"}'
```

---

## 📝 Feedback Collection

As you test, note:

### What Works Well
- List tools that work perfectly
- Natural language interpretations that were accurate
- Features that exceeded expectations

### What Needs Improvement
- Tools that didn't work as expected
- Unclear error messages
- Missing features you tried to use

### Ideas for Enhancement
- Additional tools needed
- Better natural language patterns
- UI/UX improvements

---

## 🎉 Post-Testing

After successful testing:

1. **Verify in Reminders.app**
   - Check all created reminders appear
   - Verify recurring reminders show repeat icons
   - Test location triggers (if configured)

2. **Clean Up Test Data**
   ```
   "Delete all reminders with 'test' in the title"
   ```

3. **Try Real Workflows**
   - Use for actual daily tasks
   - Test reminder notifications
   - Verify cross-device sync (if iCloud enabled)

---

## 🚀 Ready to Test!

You have:
- ✅ 12 MCP tools implemented
- ✅ Full CRUD operations
- ✅ Recurring reminders (daily, weekly, monthly)
- ✅ Location-based reminders
- ✅ Multiple alarms
- ✅ Search and filters
- ✅ Date-based queries

**Start with Phase 1 (Basic CRUD) and work your way through!**

**Estimated testing time**: 45-60 minutes for complete coverage

Happy testing! 🎊

