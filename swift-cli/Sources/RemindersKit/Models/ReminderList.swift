import Foundation
import EventKit

/// Represents a reminder list (calendar in EventKit terminology)
public struct ReminderList: Codable {
    public let id: String
    public let title: String
    public let color: String?
    public let type: String
    public let allowsContentModifications: Bool
    
    /// Initialize from EKCalendar
    public init(from calendar: EKCalendar) {
        self.id = calendar.calendarIdentifier
        self.title = calendar.title
        self.color = calendar.cgColor?.components?.map { Int($0 * 255) }.description
        self.type = calendar.type.description
        self.allowsContentModifications = calendar.allowsContentModifications
    }
    
    /// Manual initializer for testing
    public init(
        id: String,
        title: String,
        color: String? = nil,
        type: String = "Local",
        allowsContentModifications: Bool = true
    ) {
        self.id = id
        self.title = title
        self.color = color
        self.type = type
        self.allowsContentModifications = allowsContentModifications
    }
}

// Extension to make EKCalendarType convertible to String
extension EKCalendarType: @retroactive CustomStringConvertible {
    public var description: String {
        switch self {
        case .local:
            return "Local"
        case .calDAV:
            return "CalDAV"
        case .exchange:
            return "Exchange"
        case .subscription:
            return "Subscription"
        case .birthday:
            return "Birthday"
        @unknown default:
            return "Unknown"
        }
    }
}

