import Foundation
import EventKit

/// Manages reminder list (calendar) operations
public class ListManager {
    private let eventStore: EKEventStore
    private let bridge: EventKitBridge
    
    public init(bridge: EventKitBridge = .shared) {
        self.bridge = bridge
        self.eventStore = bridge.getEventStore()
    }
    
    /// Get all reminder lists
    /// - Returns: Array of reminder lists
    public func getAllLists() -> [ReminderList] {
        let calendars = bridge.getAllReminderLists()
        return calendars.map { ReminderList(from: $0) }
    }
    
    /// Get a list by ID
    /// - Parameter id: The list identifier
    /// - Returns: The list or nil if not found
    public func getList(id: String) -> ReminderList? {
        guard let calendar = bridge.findList(byId: id) else {
            return nil
        }
        return ReminderList(from: calendar)
    }
    
    /// Get a list by name
    /// - Parameter name: The list name
    /// - Returns: The list or nil if not found
    public func getList(name: String) -> ReminderList? {
        guard let calendar = bridge.findList(byName: name) else {
            return nil
        }
        return ReminderList(from: calendar)
    }
}

