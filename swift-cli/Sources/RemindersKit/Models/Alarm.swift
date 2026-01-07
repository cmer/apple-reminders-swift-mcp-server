import Foundation
import EventKit

/// Alarm for reminders
public struct ReminderAlarm: Codable {
    public let type: AlarmType
    public let absoluteDate: Date?
    public let relativeOffset: TimeInterval? // seconds before due date
    
    public init(type: AlarmType, absoluteDate: Date? = nil, relativeOffset: TimeInterval? = nil) {
        self.type = type
        self.absoluteDate = absoluteDate
        self.relativeOffset = relativeOffset
    }
    
    /// Convert to EKAlarm
    public func toEKAlarm() -> EKAlarm {
        switch type {
        case .absolute:
            if let date = absoluteDate {
                return EKAlarm(absoluteDate: date)
            }
        case .relative:
            if let offset = relativeOffset {
                return EKAlarm(relativeOffset: offset)
            }
        }
        
        // Fallback: 0 seconds before due date
        return EKAlarm(relativeOffset: 0)
    }
    
    /// Create from EKAlarm
    public static func from(_ ekAlarm: EKAlarm) -> ReminderAlarm {
        if let absoluteDate = ekAlarm.absoluteDate {
            return ReminderAlarm(type: .absolute, absoluteDate: absoluteDate)
        } else {
            return ReminderAlarm(type: .relative, relativeOffset: ekAlarm.relativeOffset)
        }
    }
}

/// Alarm type
public enum AlarmType: String, Codable {
    case absolute // Specific date/time
    case relative // Offset from due date
}

