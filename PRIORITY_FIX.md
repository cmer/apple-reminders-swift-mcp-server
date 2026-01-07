# Priority Scale Correction - IMPORTANT

## ⚠️ Breaking Change in v0.2.1

### Correct Priority Scale (EventKit/Apple Reminders)

```
0 = None (no priority)
1 = HIGH/URGENT (!!!) ← Shows 3 exclamation marks in Reminders.app
2-4 = High
5 = Medium  
6-9 = Low
```

### What Changed

**Before (INCORRECT)**:
- I mistakenly had priority 6-9 as "high"
- Priority 1 was labeled as "low"

**After (CORRECT)**:
- Priority 1 = **URGENT** (shows !!! in Reminders.app)
- Priority 5 = Medium
- Priority 9 = Low

### How to Create Urgent Reminders

**With Cursor AI**:
```
"Create an urgent reminder to call the client"
"Create a high-priority reminder for the meeting"
"Make this reminder urgent"
```

**With JSON directly**:
```json
{
  "title": "URGENT: Fix production bug",
  "priority": 1,
  "notes": "Critical issue"
}
```

### Testing

Created test reminder:
```bash
./reminders-cli create-reminder '{
  "title":"URGENT: Test with correct priority 1",
  "priority":1
}'
```

Result: ✅ Shows as urgent with `priority: 1` and `flagged: true`

### Verification

Check in Apple Reminders.app - you should see:
- **3 exclamation marks (!!!)** next to the reminder
- Reminder appears at the top of the list
- Shows as "high priority" in the UI

---

**Fixed in commit**: [current commit]  
**Tested**: ✅ Working correctly  
**Documentation**: Updated in all tool descriptions

