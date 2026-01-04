# Testing with Claude Desktop

## Setup Instructions

### 1. Get the Absolute Path to Your Project

```bash
cd /Users/krishnadesiraju/apple-reminders-mcp-server
pwd
```

Copy this path for the next step.

### 2. Configure Claude Desktop

Open or create the Claude Desktop configuration file:

**Location**: `~/.config/claude/claude_desktop_config.json` (on macOS/Linux)

Add the MCP server configuration:

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

**Important**: Replace the path with your actual project path from step 1.

### 3. Restart Claude Desktop

Completely quit and restart Claude Desktop to load the MCP server.

### 4. Verify Connection

In Claude Desktop, you should see an MCP indicator (usually a 🔌 icon or similar) showing that the server is connected.

## Test Commands

Try these natural language commands in Claude Desktop:

### Basic Commands

1. **Create a simple reminder**:
   ```
   Create a reminder to buy milk
   ```

2. **Create a reminder with details**:
   ```
   Create a high-priority reminder to call mom tomorrow at 5pm with tags #family #important
   ```

3. **List all reminders**:
   ```
   Show me all my incomplete reminders
   ```

4. **Get all lists**:
   ```
   What reminder lists do I have?
   ```

### Advanced Commands

5. **Create reminder in specific list**:
   ```
   Add "buy apples" to my Groceries list
   ```

6. **Create reminder with notes**:
   ```
   Create a reminder titled "Prepare presentation" with notes "Include Q4 results and market analysis" due next Friday
   ```

## Expected Behavior

### Success Cases

When successful, you should see:
- ✅ Confirmation message with reminder details
- The reminder appears in Apple Reminders.app immediately
- Reminder ID and list name shown

Example response:
```
✅ Created reminder: "Buy milk"

ID: 6FC8D7ED-2787-4071-9130-212BB939D504
List: Krishna's Reminders
No due date
```

### Error Cases

Common errors and solutions:

1. **"Swift CLI execution failed"**
   - Solution: Ensure Swift CLI is built: `npm run build:swift`
   - Check path in console output

2. **"Permission denied"**
   - Solution: Run `./swift-cli/.build/release/reminders-cli request-access`
   - Grant permission in System Settings > Privacy & Security > Reminders

3. **"List not found"**
   - Solution: Use `get_all_lists` to see available lists
   - Use exact list name from the output

## Debugging

### Check MCP Server Logs

Claude Desktop logs MCP server output. Check for:
- Server startup message: "Apple Reminders MCP Server running on stdio"
- Error messages from Swift CLI
- Tool call attempts

### Test Swift CLI Directly

If Claude Desktop integration isn't working, test the Swift CLI directly:

```bash
# Test creating a reminder
./swift-cli/.build/release/reminders-cli create-reminder '{"title":"Direct test"}'

# Test listing reminders
./swift-cli/.build/release/reminders-cli list-reminders '{}'

# Test getting lists
./swift-cli/.build/release/reminders-cli get-all-lists
```

### Test MCP Server with Inspector

Use the MCP Inspector tool to test the server without Claude Desktop:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a web interface to test MCP tools directly.

## Validation Checklist

- [ ] Claude Desktop shows MCP server as connected
- [ ] Can create a basic reminder successfully
- [ ] Reminder appears in Apple Reminders.app
- [ ] Can list reminders
- [ ] Can get all lists
- [ ] Can create reminders with priority, notes, tags
- [ ] Can create reminders in specific lists
- [ ] Error messages are clear and helpful

## Next Steps After Successful Testing

Once basic testing works:

1. **Implement more tools**:
   - `update_reminder` - Update existing reminders
   - `delete_reminder` - Delete reminders
   - `complete_reminder` - Mark reminders as complete
   - `search_reminders` - Search with filters
   - `get_todays_reminders` - Get reminders due today

2. **Add advanced features**:
   - Recurring reminders
   - Location-based reminders
   - Multiple alarms
   - Batch operations

3. **Polish**:
   - Add comprehensive tests
   - Improve error messages
   - Add more validation
   - Create pre-compiled binaries

## Support

If you encounter issues:
1. Check the Swift CLI works: `./swift-cli/.build/release/reminders-cli --help`
2. Verify permissions: System Settings > Privacy & Security > Reminders
3. Check Claude Desktop logs for error messages
4. Test with MCP Inspector for isolated debugging

---

**Ready to test!** Follow the setup instructions above and try creating your first reminder with Claude. 🚀

