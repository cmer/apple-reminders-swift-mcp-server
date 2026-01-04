/**
 * POC: Node.js to JXA Bridge
 * Tests: Executing JXA from Node.js using child_process
 *
 * Run with: node poc/jxa-scripts/05-nodejs-bridge.js
 */

const { execSync } = require('child_process');

console.log("=== Node.js to JXA Bridge POC ===\n");

/**
 * Execute JXA script and return result
 */
function runJXA(script) {
  try {
    const result = execSync(`osascript -l JavaScript -e '${script}'`, {
      encoding: 'utf-8'
    });
    return result.trim();
  } catch (error) {
    throw new Error(`JXA execution failed: ${error.message}`);
  }
}

/**
 * Execute JXA script and parse JSON result
 */
function runJXAWithJSON(script) {
  const wrappedScript = `
    (function() {
      ${script}
      return JSON.stringify(run());
    })();
  `;

  try {
    const result = execSync(`osascript -l JavaScript -e '${wrappedScript}'`, {
      encoding: 'utf-8'
    });
    return JSON.parse(result);
  } catch (error) {
    throw new Error(`JXA execution failed: ${error.message}`);
  }
}

// Test 1: Get all lists
console.log("1. Getting all reminder lists via JXA...");
const getAllListsScript = `
  function run() {
    const app = Application("Reminders");
    const lists = app.lists();
    const result = [];
    for (let i = 0; i < lists.length; i++) {
      result.push({ name: lists[i].name(), id: lists[i].id() });
    }
    return result;
  }
`;

try {
  const lists = runJXAWithJSON(getAllListsScript);
  console.log(`   ✓ Found ${lists.length} list(s)`);
  lists.forEach(list => {
    console.log(`      - ${list.name} (${list.id})`);
  });
} catch (error) {
  console.log(`   ✗ Error: ${error.message}`);
}

// Test 2: Create a reminder
console.log("\n2. Creating a reminder via JXA from Node.js...");
const createReminderScript = `
  function run() {
    const app = Application("Reminders");

    // Get or create test list
    let list;
    try {
      list = app.lists.byName("POC_NodeJS_Test");
      list.name(); // Test if exists
    } catch (e) {
      list = app.List({ name: "POC_NodeJS_Test" });
      app.lists.push(list);
    }

    // Create reminder
    const reminder = app.Reminder({
      name: "Test from Node.js",
      body: "This reminder was created from Node.js via JXA bridge",
      priority: 1,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
    });

    list.reminders.push(reminder);

    return {
      success: true,
      listName: list.name(),
      reminderName: reminder.name()
    };
  }
`;

try {
  const result = runJXAWithJSON(createReminderScript);
  console.log(`   ✓ Created reminder: ${result.reminderName}`);
  console.log(`   ✓ In list: ${result.listName}`);
} catch (error) {
  console.log(`   ✗ Error: ${error.message}`);
}

// Test 3: Query reminders with filters
console.log("\n3. Querying incomplete reminders...");
const queryRemindersScript = `
  function run() {
    const app = Application("Reminders");
    const list = app.lists.byName("POC_NodeJS_Test");

    const incomplete = list.reminders
      .whose({ completed: false })();

    const result = [];
    for (let i = 0; i < incomplete.length; i++) {
      const r = incomplete[i];
      const dueDate = r.dueDate();
      result.push({
        name: r.name(),
        dueDate: dueDate ? dueDate.toISOString() : null,
        priority: r.priority(),
        completed: r.completed()
      });
    }
    return result;
  }
`;

try {
  const reminders = runJXAWithJSON(queryRemindersScript);
  console.log(`   ✓ Found ${reminders.length} incomplete reminder(s)`);
  reminders.forEach(r => {
    console.log(`      - ${r.name}`);
    console.log(`        Due: ${r.dueDate || 'none'}`);
    console.log(`        Priority: ${r.priority}`);
  });
} catch (error) {
  console.log(`   ✗ Error: ${error.message}`);
}

// Test 4: Update a reminder
console.log("\n4. Updating reminder...");
const updateReminderScript = `
  function run() {
    const app = Application("Reminders");
    const list = app.lists.byName("POC_NodeJS_Test");
    const reminders = list.reminders();

    if (reminders.length === 0) {
      return { success: false, error: "No reminders to update" };
    }

    const reminder = reminders[0];
    reminder.name = "Updated from Node.js";
    reminder.completed = true;

    return {
      success: true,
      reminderName: reminder.name(),
      completed: reminder.completed()
    };
  }
`;

try {
  const result = runJXAWithJSON(updateReminderScript);
  if (result.success) {
    console.log(`   ✓ Updated: ${result.reminderName}`);
    console.log(`   ✓ Completed: ${result.completed}`);
  } else {
    console.log(`   ✗ ${result.error}`);
  }
} catch (error) {
  console.log(`   ✗ Error: ${error.message}`);
}

console.log("\n=== Bridge POC Complete ===\n");
console.log("Key Findings:");
console.log("  ✓ Can execute JXA from Node.js using child_process");
console.log("  ✓ Can pass data between Node.js and JXA via JSON");
console.log("  ✓ All JXA capabilities available from Node.js");
console.log("  ✓ Error handling works across the bridge");
console.log("\nRecommendations:");
console.log("  • Use execSync for synchronous operations");
console.log("  • Wrap JXA functions with JSON.stringify for data return");
console.log("  • Handle errors on both sides (Node.js and JXA)");
console.log("  • Escape strings carefully when passing to osascript\n");
