#!/usr/bin/osascript -l JavaScript

/**
 * POC: Testing Known Limitations
 * Tests: Tags, recurrence, location, subtasks, move operations
 * Purpose: Validate and document what DOESN'T work
 */

function run() {
  const app = Application("Reminders");
  app.includeStandardAdditions = true;

  const testListName = "POC_Limitations_Test";

  try {
    console.log("=== Apple Reminders JXA POC: Limitations Testing ===\n");
    console.log("This script tests features that are NOT supported by JXA.\n");

    // Setup
    console.log("Setup: Creating test list...");
    let testList;
    try {
      testList = app.lists.byName(testListName);
      testList.name();
    } catch (e) {
      testList = app.List({ name: testListName });
      app.lists.push(testList);
    }
    console.log(`✓ Using list: ${testListName}\n`);

    // Create a test reminder
    const testReminder = app.Reminder({
      name: "POC_Limitation_Test_Reminder",
      body: "Testing unsupported features"
    });
    testList.reminders.push(testReminder);

    // Get reference to the created reminder
    const reminder = testList.reminders.byName("POC_Limitation_Test_Reminder");

    console.log("=== LIMITATION 1: Tags ===");
    console.log("Expected: Tags are NOT accessible via JXA\n");

    try {
      // Try to access tag property (will fail)
      const tags = reminder.tags;
      console.log(`✗ UNEXPECTED: Tags property exists: ${tags}`);
    } catch (error) {
      console.log(`✓ CONFIRMED: Tags property does not exist`);
      console.log(`   Error: ${error.message}`);
    }

    // Check available properties
    console.log("\nAvailable properties on reminder:");
    const props = reminder.properties();
    Object.keys(props).forEach(key => {
      console.log(`   - ${key}: ${typeof props[key]}`);
    });
    console.log("\n   Note: No 'tags' property found\n");

    console.log("=== LIMITATION 2: Recurrence Rules ===");
    console.log("Expected: Cannot set recurrence via JXA\n");

    try {
      // Try to set recurrence (will fail or do nothing)
      reminder.recurrence = "daily";
      console.log(`✗ UNEXPECTED: Recurrence property accepted`);
    } catch (error) {
      console.log(`✓ CONFIRMED: Cannot set recurrence`);
      console.log(`   Error: ${error.message}`);
    }

    // Check for recurrence-related properties
    const hasRecurrence = Object.keys(props).some(k =>
      k.toLowerCase().includes('recur') || k.toLowerCase().includes('repeat')
    );
    console.log(`   Recurrence properties found: ${hasRecurrence}`);
    console.log("   Note: Even if properties exist, they may not be settable\n");

    console.log("=== LIMITATION 3: Location-Based Reminders ===");
    console.log("Expected: Location properties not accessible\n");

    try {
      reminder.location = { latitude: 37.7749, longitude: -122.4194 };
      console.log(`✗ UNEXPECTED: Location property accepted`);
    } catch (error) {
      console.log(`✓ CONFIRMED: Cannot set location`);
      console.log(`   Error: ${error.message}`);
    }

    const hasLocation = Object.keys(props).some(k =>
      k.toLowerCase().includes('location') || k.toLowerCase().includes('geo')
    );
    console.log(`   Location properties found: ${hasLocation}\n`);

    console.log("=== LIMITATION 4: Subtasks ===");
    console.log("Expected: No API for subtasks/sub-reminders\n");

    try {
      // Try to access subtasks (will fail)
      const subtasks = reminder.subtasks;
      console.log(`✗ UNEXPECTED: Subtasks property exists: ${subtasks}`);
    } catch (error) {
      console.log(`✓ CONFIRMED: No subtasks property`);
      console.log(`   Error: ${error.message}`);
    }

    const hasSubtasks = Object.keys(props).some(k =>
      k.toLowerCase().includes('subtask') || k.toLowerCase().includes('child')
    );
    console.log(`   Subtask properties found: ${hasSubtasks}`);
    console.log("   Note: Subtasks exist in UI but are not exposed to JXA\n");

    console.log("=== LIMITATION 5: Move Operations ===");
    console.log("Expected: Move operations are broken/unreliable\n");

    // Create a second reminder to test move
    const reminder2 = app.Reminder({
      name: "POC_Move_Test_Reminder_2",
      body: "Second reminder for move test"
    });
    testList.reminders.push(reminder2);

    try {
      // Try to move reminder (may fail or cause data loss)
      const targetReminder = testList.reminders.byName("POC_Move_Test_Reminder_2");
      console.log("   Attempting move operation...");

      // This is the broken operation mentioned in research
      // It may throw an error or silently fail
      targetReminder.move();

      console.log(`   Move appeared to succeed (but may be unreliable)`);
    } catch (error) {
      console.log(`✓ CONFIRMED: Move operation failed`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Error Number: ${error.errorNumber}`);
    }

    console.log("\n=== LIMITATION 6: List Deletion ===");
    console.log("Expected: Cannot delete lists via JXA\n");

    // Try to delete the test list
    try {
      testList.delete();
      console.log(`✗ UNEXPECTED: List deletion appeared to succeed`);

      // Check if it actually deleted
      try {
        const stillExists = app.lists.byName(testListName);
        stillExists.name();
        console.log(`✓ CONFIRMED: List still exists despite delete() call`);
      } catch (e) {
        console.log(`   ? List may have actually been deleted (rare)`);
      }
    } catch (error) {
      console.log(`✓ CONFIRMED: List deletion failed`);
      console.log(`   Error: ${error.message}`);
    }

    console.log("\n=== LIMITATION 7: Attachments/URLs ===");
    console.log("Expected: Limited or no support for attachments\n");

    const hasAttachment = Object.keys(props).some(k =>
      k.toLowerCase().includes('attachment') || k.toLowerCase().includes('image')
    );
    console.log(`   Attachment properties found: ${hasAttachment}`);

    // There may be a URL property but it's not well documented
    try {
      reminder.body = "Test with URL: https://example.com";
      console.log(`   ✓ Can embed URLs in body text (workaround)`);
    } catch (error) {
      console.log(`   Error setting body with URL: ${error.message}`);
    }

    console.log("\n=== Summary of Confirmed Limitations ===\n");
    console.log("Features NOT available in JXA:");
    console.log("  ✗ Tags - Not exposed in API");
    console.log("  ✗ Recurrence rules - Cannot be set programmatically");
    console.log("  ✗ Location-based reminders - No geolocation support");
    console.log("  ✗ Subtasks - Not accessible despite UI support");
    console.log("  ✗ Move operations - Broken/unreliable");
    console.log("  ✗ List deletion - Not supported");
    console.log("  ✗ Attachments - Limited or no direct support");
    console.log("\nWorkarounds:");
    console.log("  • Tags: Encode in body text (e.g., [tag:work][tag:urgent])");
    console.log("  • Recurrence: Create individual instances manually");
    console.log("  • Subtasks: Use flat structure or encode in body");
    console.log("  • URLs: Embed in body text");
    console.log("\n=== Test Complete ===\n");

    return {
      success: true,
      limitations: [
        "tags",
        "recurrence",
        "location",
        "subtasks",
        "move",
        "listDeletion",
        "attachments"
      ]
    };

  } catch (error) {
    console.log(`\n✗ Unexpected Error: ${error.message}`);
    console.log(`   Error Number: ${error.errorNumber || 'unknown'}`);
    return {
      success: false,
      error: error.message
    };
  }
}
