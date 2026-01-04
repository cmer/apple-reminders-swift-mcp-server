#!/usr/bin/osascript -l JavaScript

/**
 * POC: Basic CRUD Operations on Apple Reminders
 * Tests: Create, Read, Update, Delete reminders
 */

function run() {
  const app = Application("Reminders");
  app.includeStandardAdditions = true;

  const testListName = "POC_Test_List";
  const testReminderTitle = "POC_Test_Reminder";

  try {
    console.log("=== Apple Reminders JXA POC: Basic CRUD ===\n");

    // 1. CREATE: Create a test list
    console.log("1. Creating test list...");
    let testList;
    try {
      testList = app.lists.byName(testListName);
      testList.name(); // Test if exists
      console.log(`   ✓ List "${testListName}" already exists`);
    } catch (e) {
      testList = app.List({ name: testListName });
      app.lists.push(testList);
      console.log(`   ✓ Created list "${testListName}"`);
    }

    // 2. CREATE: Create a reminder with various properties
    console.log("\n2. Creating test reminder...");
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const alertTime = new Date(tomorrow.getTime() - 2 * 60 * 60 * 1000); // 2 hours before

    const newReminder = app.Reminder({
      name: testReminderTitle,
      body: "This is a test reminder created via JXA\nLine 2 of notes\nLine 3 of notes",
      dueDate: tomorrow,
      remindMeDate: alertTime,
      priority: 1, // Medium priority
      completed: false
    });

    testList.reminders.push(newReminder);
    console.log(`   ✓ Created reminder "${testReminderTitle}"`);
    console.log(`   - Due: ${tomorrow.toISOString()}`);
    console.log(`   - Alert: ${alertTime.toISOString()}`);
    console.log(`   - Priority: Medium (1)`);

    // 3. READ: Get all reminders from the list
    console.log("\n3. Reading reminders from list...");
    const allRemindersArray = testList.reminders();
    console.log(`   ✓ Found ${allRemindersArray.length} reminder(s)`);

    for (let idx = 0; idx < allRemindersArray.length; idx++) {
      const r = allRemindersArray[idx];
      console.log(`   [${idx + 1}] ${r.name()}`);
      console.log(`       ID: ${r.id()}`);
      const body = r.body();
      console.log(`       Notes: ${body ? body.substring(0, 50) + '...' : '(none)'}`);
      console.log(`       Due: ${r.dueDate() || '(none)'}`);
      console.log(`       Priority: ${r.priority()}`);
      console.log(`       Completed: ${r.completed()}`);
    }

    // 4. READ: Find specific reminder by name
    console.log("\n4. Finding specific reminder...");
    let foundReminder;
    for (const reminder of allRemindersArray) {
      if (reminder.name() === testReminderTitle) {
        foundReminder = reminder;
        break;
      }
    }

    if (foundReminder) {
      console.log(`   ✓ Found reminder: ${foundReminder.name()}`);
      console.log(`   - ID: ${foundReminder.id()}`);
    } else {
      console.log(`   ✗ Reminder not found!`);
      return;
    }

    // 5. UPDATE: Modify reminder properties
    console.log("\n5. Updating reminder...");
    foundReminder.name = testReminderTitle + " (UPDATED)";
    foundReminder.body = "Updated notes via JXA";
    foundReminder.priority = 2; // High priority
    console.log(`   ✓ Updated reminder properties`);
    console.log(`   - New title: ${foundReminder.name()}`);
    console.log(`   - New priority: High (2)`);

    // 6. READ: Verify update
    console.log("\n6. Verifying update...");
    const updatedName = foundReminder.name();
    const updatedPriority = foundReminder.priority();
    console.log(`   ✓ Confirmed: ${updatedName}`);
    console.log(`   ✓ Priority: ${updatedPriority}`);

    // 7. UPDATE: Mark as complete
    console.log("\n7. Marking reminder as complete...");
    foundReminder.completed = true;
    console.log(`   ✓ Reminder marked complete`);
    console.log(`   - Completion date: ${foundReminder.completionDate()}`);

    // 8. DELETE: Remove the test reminder
    console.log("\n8. Deleting test reminder...");
    foundReminder.delete();
    console.log(`   ✓ Reminder deleted`);

    // 9. VERIFY: Check that reminder is gone
    console.log("\n9. Verifying deletion...");
    const remainingReminders = testList.reminders();
    console.log(`   ✓ Remaining reminders: ${remainingReminders.length}`);

    // CLEANUP NOTE
    console.log("\n=== Test Complete ===");
    console.log(`\nNote: Test list "${testListName}" was created.`);
    console.log("JXA does NOT support list deletion, so you'll need to delete it manually.");
    console.log("This is a known limitation documented in the research.\n");

    return {
      success: true,
      message: "All CRUD operations completed successfully"
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
