# Urgent Reminder Feature - Current Status

## 🚨 Important Discovery (January 2026)

### The Issue
Apple introduced an "**Urgent**" feature in Reminders.app for macOS 26.2 and iOS 26.2 that shows alarms even when Focus mode is active. However, **this feature is NOT currently exposed in the EventKit API**.

### What We Tested

1. ✅ **Priority `1`** correctly marks reminders as high priority (shows !!! in Reminders.app)
2. ✅ **Flagged status** correctly shows the flag icon
3. ❌ **Urgent alarm feature** is NOT accessible via EventKit

### Technical Details

```swift
// Attempted to find the urgent property:
- Checked via Mirror (reflection): Not found
- Checked via KVC (key-value coding): Not found
- Checked via selectors (isUrgent, urgent, setUrgent:): Not found
- Checked in EventKit headers: Not found
```

**Result**: The "Urgent" feature is a **UI-only feature** in Reminders.app that Apple has NOT exposed to third-party developers via EventKit.

### What Works (Our Current Implementation)

```json
{
  "title": "Important task",
  "priority": 1,     // ✅ Shows !!! (high priority)
  "flagged": true    // ✅ Shows flag icon
}
```

This gives you:
- ✅ High priority indicator (!!!)
- ✅ Flag icon
- ✅ Appears at top of reminders list
- ❌ **NOT the same as the "Urgent" alarm feature**

### The Urgent Feature (Not Available via API)

The "Urgent" feature in Reminders.app:
- Shows a full-screen alarm notification
- Works even in Focus mode
- Cannot be dismissed without interaction
- **NOT accessible via EventKit**

### When Will This Be Available?

Apple has not announced when (or if) they will add EventKit API support for the Urgent feature. Historically, Apple sometimes adds UI features before providing API access.

**Options**:
1. **Wait** for Apple to update EventKit (could be months/years)
2. **Use private APIs** (not recommended, violates App Store guidelines)
3. **File a radar** with Apple requesting EventKit support

### Workaround

The closest approximation is:
```json
{
  "title": "URGENT: Critical task",
  "priority": 1,
  "flagged": true,
  "alarms": [
    {"offsetMinutes": 0}  // Alarm at due time
  ]
}
```

This provides:
- High priority (!!!)
- Flag icon
- Standard alarm notification
- **But NOT the special "Urgent" alarm behavior**

### Apple Feedback

I recommend filing a feature request with Apple:
https://feedbackassistant.apple.com/

Request: "Add EventKit API support for the Urgent reminder feature introduced in macOS 26.2"

---

**Last tested**: January 7, 2026  
**macOS version**: 26.2  
**EventKit SDK**: 26.2  
**Result**: Urgent feature NOT available in EventKit

