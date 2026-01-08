# Cursor AI MCP Server Setup Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Open Cursor Settings
Press `Cmd + Shift + J` or go to **Cursor Settings** → **MCP**

### Step 2: Add Configuration
Add this to your MCP configuration:

```json
{
  "mcpServers": {
    "apple-reminders": {
      "command": "node",
      "args": [
        "/Users/krishnadesiraju/apple-reminders-mcp-server/dist/index.js"
      ]
    }
  }
}
```

### Step 3: Restart Cursor
Close and reopen Cursor for the changes to take effect.

---

## ✅ Verify It's Working

Once Cursor restarts, try these commands in the chat:

### Test Commands
```
"Show me my reminders for today"
"Create a reminder to call mom tomorrow at 2pm"
"Show me all my 🏡 home reminders"
"What reminders are overdue?"
"Show me all flagged reminders"
```

### Expected Behavior
- Cursor should have access to your Apple Reminders
- You should see the MCP server icon/indicator when it's active
- Commands should work without you needing to manually run any scripts

---

## 📋 Available Commands

### Basic Operations
- "Create a reminder to..."
- "Show me my reminders"
- "Mark [reminder name] as complete"
- "Update the [reminder name] reminder"
- "Delete the [reminder name] reminder"

### Advanced Features
- "Create an urgent reminder (priority 1) to..."
- "Create a weekly reminder every Monday at 9am"
- "Create a reminder that triggers when I arrive home"
- "Show me all reminders for 🏡"
- "Search for reminders about meetings"

### Date Queries
- "Show me today's reminders"
- "What reminders are overdue?"
- "Show me completed reminders"
- "Show me all flagged reminders"

---

## 🏡 Your Home Reminders

All your home maintenance reminders are now searchable:
- Search by emoji: "Show me all 🏡 reminders"
- Search by property: "Show reminders for 524 Golden Star Dr"
- Search by location: "Show Bolingbrook reminders"

---

## 🔧 Troubleshooting

### MCP Server Not Showing Up?
1. Check the path in the configuration is correct
2. Make sure you restarted Cursor completely
3. Check Cursor's MCP logs for errors

### Permission Denied?
The first time you run a command, macOS will ask for permission to access Reminders. Click "Allow".

### Commands Not Working?
Try running manually to test:
```bash
cd /Users/krishnadesiraju/apple-reminders-mcp-server
node dist/index.js
```

Then type a test command like:
```
{"method":"tools/list"}
```

---

## 📚 More Information

- Full tool list: See `FEATURE_SUMMARY.md`
- Testing guide: See `CURSOR_TESTING_GUIDE.md`
- Release notes: See `RELEASE_v0.2.0.md`

---

## ✨ Pro Tips

1. **Be specific with dates**: "tomorrow at 2pm" works better than "tomorrow"
2. **Use natural language**: Cursor understands conversational requests
3. **Reference by title**: "Update the mortgage reminder" will find it
4. **Use emojis**: "Show 🏡 reminders" is a quick filter
5. **Priority levels**: 
   - Priority 1 = Urgent (shows !!!)
   - Priority 5 = Medium
   - Priority 9 = Low

---

**You're all set!** 🎉




