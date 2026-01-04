#!/usr/bin/osascript -l JavaScript

/**
 * Cleanup script to remove all POC test data
 * Deletes reminders from POC lists, then attempts to delete lists
 */

function run() {
  const app = Application("Reminders");
  app.includeStandardAdditions = true;

  console.log("=== POC Cleanup Script ===\n");

  const pocListPrefixes = [
    "POC_Test_List",
    "POC_Advanced_List",
    "POC_Date_Test",
    "POC_Limitations_Test",
    "POC_NodeJS_Test"
  ];

  let deletedReminders = 0;
  let deletedLists = 0;

  try {
    // Get all lists
    const allLists = app.lists();
    console.log(`Found ${allLists.length} total lists\n`);

    // Process each POC list
    for (let i = 0; i < allLists.length; i++) {
      const list = allLists[i];
      const listName = list.name();

      // Check if this is a POC list
      const isPOCList = pocListPrefixes.some(prefix => listName.startsWith(prefix) || listName === prefix);

      if (isPOCList) {
        console.log(`Processing: ${listName}`);

        // Delete all reminders in this list
        const reminders = list.reminders();
        console.log(`  Found ${reminders.length} reminder(s)`);

        for (let j = 0; j < reminders.length; j++) {
          try {
            reminders[j].delete();
            deletedReminders++;
          } catch (error) {
            console.log(`  ✗ Failed to delete reminder: ${error.message}`);
          }
        }

        console.log(`  ✓ Deleted ${reminders.length} reminder(s)`);

        // Try to delete the list (may not work due to JXA limitation)
        try {
          list.delete();
          console.log(`  ✓ Deleted list: ${listName}`);
          deletedLists++;
        } catch (error) {
          console.log(`  ⚠ Could not delete list (expected JXA limitation)`);
          console.log(`  → Please manually delete "${listName}" from Reminders app`);
        }

        console.log();
      }
    }

    // Also clean up any stray POC reminders in other lists
    console.log("Checking for stray POC reminders in other lists...");
    const allListsAgain = app.lists();
    let strays = 0;

    for (let i = 0; i < allListsAgain.length; i++) {
      const list = allListsAgain[i];
      const reminders = list.reminders();

      for (let j = 0; j < reminders.length; j++) {
        const name = reminders[j].name();
        if (name.startsWith("POC_") || name.startsWith("Test from Node")) {
          try {
            console.log(`  Deleting stray: ${name} (from ${list.name()})`);
            reminders[j].delete();
            strays++;
          } catch (error) {
            console.log(`  ✗ Failed: ${error.message}`);
          }
        }
      }
    }

    console.log(`\n=== Cleanup Summary ===`);
    console.log(`Deleted reminders: ${deletedReminders + strays}`);
    console.log(`Deleted lists: ${deletedLists}`);

    if (deletedLists < pocListPrefixes.length) {
      console.log(`\n⚠ Manual cleanup required:`);
      console.log(`Please open Reminders app and manually delete these lists:`);
      pocListPrefixes.forEach(name => {
        console.log(`  - ${name}`);
      });
    }

    console.log("\n✓ Cleanup complete!\n");

    return {
      success: true,
      deletedReminders: deletedReminders + strays,
      deletedLists: deletedLists
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
