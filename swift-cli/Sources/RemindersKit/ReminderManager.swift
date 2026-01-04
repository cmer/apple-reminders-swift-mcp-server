import Foundation
import EventKit

/// Manages reminder CRUD operations using EventKit
public class ReminderManager {
    private let eventStore: EKEventStore
    private let bridge: EventKitBridge
    
    public init(bridge: EventKitBridge = .shared) {
        self.bridge = bridge
        self.eventStore = bridge.getEventStore()
    }
    
    /// Create a new reminder
    /// - Parameter input: The reminder creation input
    /// - Returns: The created reminder
    public func createReminder(input: CreateReminderInput) throws -> Reminder {
        // Create EKReminder instance
        let ekReminder = EKReminder(eventStore: eventStore)
        
        // Set basic properties
        ekReminder.title = input.title
        
        // Handle notes with tags
        if let tags = input.tags, !tags.isEmpty {
            let tagString = tags.map { "[#\($0)]" }.joined(separator: " ")
            if let notes = input.notes {
                ekReminder.notes = "\(tagString)\n\(notes)"
            } else {
                ekReminder.notes = tagString
            }
        } else {
            ekReminder.notes = input.notes
        }
        
        // Set priority (0-9 scale)
        if let priority = input.priority {
            ekReminder.priority = max(0, min(9, priority))
        }
        
        // Set due date
        if let dueDateString = input.dueDate {
            let date = try parseDateString(dueDateString)
            ekReminder.dueDateComponents = Calendar.current.dateComponents(
                [.year, .month, .day, .hour, .minute],
                from: date
            )
        }
        
        // Set URL
        if let urlString = input.url {
            ekReminder.url = URL(string: urlString)
        }
        
        // Find or use default calendar
        let calendar: EKCalendar
        if let listName = input.listName {
            if let foundCalendar = bridge.findList(byName: listName) {
                calendar = foundCalendar
            } else {
                throw ReminderError.listNotFound(listName)
            }
        } else {
            if let defaultCalendar = bridge.getDefaultRemindersList() {
                calendar = defaultCalendar
            } else {
                throw ReminderError.noDefaultList
            }
        }
        
        ekReminder.calendar = calendar
        
        // Save the reminder
        try eventStore.save(ekReminder, commit: true)
        
        // Return our model
        return Reminder(from: ekReminder)
    }
    
    /// Get a reminder by ID
    /// - Parameter id: The reminder identifier
    /// - Returns: The reminder or nil if not found
    public func getReminder(id: String) throws -> Reminder? {
        guard let ekReminder = eventStore.calendarItem(withIdentifier: id) as? EKReminder else {
            return nil
        }
        return Reminder(from: ekReminder)
    }
    
    /// Get all reminders (with optional filters)
    /// - Parameter completed: Filter by completion status (nil = all)
    /// - Returns: Array of reminders
    public func getAllReminders(completed: Bool? = nil) async throws -> [Reminder] {
        let calendars = bridge.getAllReminderLists()
        
        // Create predicate
        let predicate = eventStore.predicateForReminders(in: calendars)
        
        // Fetch reminders
        let ekReminders = try await withCheckedThrowingContinuation { continuation in
            eventStore.fetchReminders(matching: predicate) { reminders in
                if let reminders = reminders {
                    continuation.resume(returning: reminders)
                } else {
                    continuation.resume(returning: [])
                }
            }
        }
        
        // Filter by completion status if specified
        let filteredReminders = if let completed = completed {
            ekReminders.filter { $0.isCompleted == completed }
        } else {
            ekReminders
        }
        
        return filteredReminders.map { Reminder(from: $0) }
    }
    
    /// Delete a reminder
    /// - Parameter id: The reminder identifier
    public func deleteReminder(id: String) throws {
        guard let ekReminder = eventStore.calendarItem(withIdentifier: id) as? EKReminder else {
            throw ReminderError.reminderNotFound(id)
        }
        
        try eventStore.remove(ekReminder, commit: true)
    }
    
    /// Mark a reminder as complete
    /// - Parameter id: The reminder identifier
    /// - Returns: The updated reminder
    public func completeReminder(id: String) throws -> Reminder {
        guard let ekReminder = eventStore.calendarItem(withIdentifier: id) as? EKReminder else {
            throw ReminderError.reminderNotFound(id)
        }
        
        ekReminder.isCompleted = true
        ekReminder.completionDate = Date()
        
        try eventStore.save(ekReminder, commit: true)
        
        return Reminder(from: ekReminder)
    }
    
    // MARK: - Private Helpers
    
    /// Parse ISO 8601 date string
    private func parseDateString(_ dateString: String) throws -> Date {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        if let date = formatter.date(from: dateString) {
            return date
        }
        
        // Try without fractional seconds
        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: dateString) {
            return date
        }
        
        throw ReminderError.invalidDateFormat(dateString)
    }
}

/// Errors that can occur during reminder operations
public enum ReminderError: Error, CustomStringConvertible {
    case listNotFound(String)
    case noDefaultList
    case reminderNotFound(String)
    case invalidDateFormat(String)
    case permissionDenied
    
    public var description: String {
        switch self {
        case .listNotFound(let name):
            return "List not found: \(name)"
        case .noDefaultList:
            return "No default list found"
        case .reminderNotFound(let id):
            return "Reminder not found: \(id)"
        case .invalidDateFormat(let format):
            return "Invalid date format: \(format). Expected ISO 8601."
        case .permissionDenied:
            return "Permission denied to access reminders"
        }
    }
}

