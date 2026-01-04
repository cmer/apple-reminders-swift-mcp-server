#!/usr/bin/osascript -l JavaScript

/**
 * POC: Date Filtering and Search
 * Tests: Date-based queries, filtering, whose clauses
 */

function run() {
  const app = Application("Reminders");
  app.includeStandardAdditions = true;

  const testListName = "POC_Date_Test";

  try {
    console.log("=== Apple Reminders JXA POC: Date Filtering ===\n");

    // 1. Create test list
    console.log("1. Setting up test list...");
    let testList;
    try {
      testList = app.lists.byName(testListName);
      testList.name();
    } catch (e) {
      testList = app.List({ name: testListName });
      app.lists.push(testList);
    }
    console.log(`   ✓ Using list: ${testListName}`);

    // 2. Create test reminders with different dates
    console.log("\n2. Creating test reminders with various dates...");
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const testReminders = [
      { name: "POC_Overdue", dueDate: yesterday, priority: 2 },
      { name: "POC_Today", dueDate: now, priority: 1 },
      { name: "POC_Tomorrow", dueDate: tomorrow, priority: 1 },
      { name: "POC_Next_Week", dueDate: nextWeek, priority: 0 },
      { name: "POC_No_Date", dueDate: null, priority: 0 }
    ];

    // Clean up existing test reminders first
    const existingReminders = testList.reminders();
    existingReminders.forEach(r => {
      if (r.name().startsWith("POC_")) {
        r.delete();
      }
    });

    testReminders.forEach(tr => {
      const reminder = app.Reminder({
        name: tr.name,
        body: `Test reminder for date filtering`,
        dueDate: tr.dueDate,
        priority: tr.priority,
        completed: false
      });
      testList.reminders.push(reminder);
      console.log(`   ✓ Created: ${tr.name} (due: ${tr.dueDate ? tr.dueDate.toDateString() : 'none'})`);
    });

    // 3. Get all reminders (baseline)
    console.log("\n3. Getting all reminders...");
    const allReminders = testList.reminders();
    console.log(`   ✓ Total reminders: ${allReminders.length}`);

    // 4. Filter: Incomplete reminders
    console.log("\n4. Filtering incomplete reminders...");
    const incomplete = testList.reminders.whose({
      completed: false
    })();
    console.log(`   ✓ Incomplete: ${incomplete.length}`);
    incomplete.forEach(r => console.log(`      - ${r.name()}`));

    // 5. Filter: High priority reminders
    console.log("\n5. Filtering high priority reminders...");
    const highPriority = testList.reminders.whose({
      priority: 2
    })();
    console.log(`   ✓ High priority: ${highPriority.length}`);
    highPriority.forEach(r => console.log(`      - ${r.name()} (priority ${r.priority()})`));

    // 6. Filter: Reminders due before tomorrow
    console.log("\n6. Filtering reminders due before tomorrow...");
    const dueSoon = testList.reminders.whose({
      dueDate: { _lessThan: tomorrow }
    })();
    console.log(`   ✓ Due before tomorrow: ${dueSoon.length}`);
    dueSoon.forEach(r => {
      const dueDate = r.dueDate();
      console.log(`      - ${r.name()} (${dueDate ? dueDate.toDateString() : 'no date'})`);
    });

    // 7. Filter: Reminders due after today
    console.log("\n7. Filtering reminders due after today...");
    const dueAfter = testList.reminders.whose({
      dueDate: { _greaterThan: now }
    })();
    console.log(`   ✓ Due after today: ${dueAfter.length}`);
    dueAfter.forEach(r => console.log(`      - ${r.name()} (${r.dueDate().toDateString()})`));

    // 8. Complex filter: Incomplete AND high priority
    console.log("\n8. Complex filter: Incomplete AND high priority...");
    const urgentIncomplete = testList.reminders.whose({
      _and: [
        { completed: false },
        { priority: 2 }
      ]
    })();
    console.log(`   ✓ Urgent incomplete: ${urgentIncomplete.length}`);
    urgentIncomplete.forEach(r => console.log(`      - ${r.name()}`));

    // 9. Complex filter: Incomplete AND due before tomorrow
    console.log("\n9. Complex filter: Incomplete AND due before tomorrow...");
    const actionable = testList.reminders.whose({
      _and: [
        { completed: false },
        { dueDate: { _lessThan: tomorrow } }
      ]
    })();
    console.log(`   ✓ Actionable items: ${actionable.length}`);
    actionable.forEach(r => {
      const dueDate = r.dueDate();
      console.log(`      - ${r.name()} (due: ${dueDate ? dueDate.toDateString() : 'no date'})`);
    });

    // 10. Test: Reminders with no due date
    console.log("\n10. Finding reminders without due dates...");
    // Note: This is tricky in JXA - need to filter manually
    const noDueDate = allReminders.filter(r => !r.dueDate());
    console.log(`   ✓ No due date: ${noDueDate.length}`);
    noDueDate.forEach(r => console.log(`      - ${r.name()}`));

    console.log("\n=== Test Complete ===");
    console.log("\nKey Findings:");
    console.log("- whose() clause works for basic filtering");
    console.log("- Date comparison operators (_lessThan, _greaterThan) work");
    console.log("- Complex filters with _and work");
    console.log("- Null/undefined date filtering requires manual filtering");
    console.log("- Performance: Use .properties() for efficient property access\n");

    return {
      success: true,
      totalReminders: allReminders.length,
      incomplete: incomplete.length,
      highPriority: highPriority.length
    };

  } catch (error) {
    console.log(`\n✗ Error: ${error.message}`);
    console.log(`   Error Number: ${error.errorNumber || 'unknown'}`);
    if (error.stack) {
      console.log(`   Stack: ${error.stack}`);
    }
    return {
      success: false,
      error: error.message
    };
  }
}
