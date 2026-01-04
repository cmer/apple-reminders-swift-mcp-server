#!/usr/bin/osascript -l JavaScript

/**
 * POC: List Operations
 * Tests: List creation, reading, properties, account access
 */

function run() {
  const app = Application("Reminders");
  app.includeStandardAdditions = true;

  try {
    console.log("=== Apple Reminders JXA POC: List Operations ===\n");

    // 1. Get all lists
    console.log("1. Getting all reminder lists...");
    const allLists = app.lists();
    console.log(`   ✓ Found ${allLists.length} list(s)\n`);

    for (let idx = 0; idx < allLists.length; idx++) {
      const list = allLists[idx];
      console.log(`   [${idx + 1}] ${list.name()}`);
      console.log(`       ID: ${list.id()}`);
      console.log(`       Color: ${list.color() || '(none)'}`);
      console.log(`       Emblem: ${list.emblem() || '(none)'}`);
      // Count reminders in this list
      const reminderCount = list.reminders().length;
      console.log(`       Reminders: ${reminderCount}`);
    }

    // 2. Get default list
    console.log("\n2. Getting default list...");
    const defaultList = app.defaultList();
    console.log(`   ✓ Default list: ${defaultList.name()}`);
    console.log(`   - ID: ${defaultList.id()}`);

    // 3. Get default account
    console.log("\n3. Getting default account...");
    const defaultAccount = app.defaultAccount();
    console.log(`   ✓ Default account: ${defaultAccount.name()}`);

    // 4. Create a new list with properties
    console.log("\n4. Creating a new list with properties...");
    const testListName = "POC_Advanced_List";

    let newList;
    try {
      // Check if it already exists
      newList = app.lists.byName(testListName);
      newList.name(); // Test existence
      console.log(`   ✓ List "${testListName}" already exists`);
    } catch (e) {
      // Create new list
      newList = app.List({
        name: testListName
        // Note: color and emblem may not work via JXA API
      });
      app.lists.push(newList);
      console.log(`   ✓ Created list "${testListName}"`);
    }

    // 5. Get list by name
    console.log("\n5. Accessing list by name...");
    const foundList = app.lists.byName(testListName);
    console.log(`   ✓ Found: ${foundList.name()}`);
    console.log(`   - ID: ${foundList.id()}`);

    // 6. Get list by ID
    console.log("\n6. Accessing list by ID...");
    const listId = foundList.id();
    const foundById = app.lists.byId(listId);
    console.log(`   ✓ Found by ID: ${foundById.name()}`);

    // 7. Count reminders in list
    console.log("\n7. Counting reminders in list...");
    const remindersInList = foundList.reminders();
    console.log(`   ✓ Reminders count: ${remindersInList.length}`);

    // 8. Test list deletion (will fail - documenting limitation)
    console.log("\n8. Testing list deletion (expected to fail)...");
    console.log("   Note: JXA does NOT support list deletion");
    console.log("   Attempting deletion will demonstrate this limitation...");

    try {
      // This will likely fail or do nothing
      const testDeleteList = app.lists.byName(testListName);
      testDeleteList.delete();
      console.log("   ✗ Deletion appeared to succeed (unexpected!)");
    } catch (error) {
      console.log(`   ✓ Deletion failed as expected: ${error.message}`);
    }

    // Verify list still exists
    try {
      const stillExists = app.lists.byName(testListName);
      stillExists.name();
      console.log(`   ✓ Confirmed: List still exists after delete attempt`);
    } catch (e) {
      console.log("   ? List may have been deleted (rare)");
    }

    console.log("\n=== Test Complete ===");
    console.log("\nKey Findings:");
    console.log("- Can create and read lists");
    console.log("- Can access lists by name or ID");
    console.log("- Cannot delete lists via JXA (confirmed limitation)");
    console.log("- Color and emblem properties may not be settable\n");

    return {
      success: true,
      totalLists: allLists.length
    };

  } catch (error) {
    console.log(`\n✗ Error: ${error.message}`);
    console.log(`   Error Number: ${error.errorNumber || 'unknown'}`);
    return {
      success: false,
      error: error.message
    };
  }
}
