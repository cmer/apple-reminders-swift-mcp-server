import Foundation
import EventKit

/// Recurrence frequency for repeating reminders
public enum RecurrenceFrequency: String, Codable {
    case daily
    case weekly
    case monthly
    case yearly
}

/// Recurrence rule for repeating reminders
public struct RecurrenceRule: Codable {
    public let frequency: RecurrenceFrequency
    public let interval: Int // e.g., every 2 weeks
    public let endDate: Date?
    public let occurrenceCount: Int? // e.g., repeat 10 times
    public let daysOfWeek: [Int]? // 1 = Sunday, 7 = Saturday
    public let daysOfMonth: [Int]? // 1-31
    public let monthsOfYear: [Int]? // 1-12
    
    public init(
        frequency: RecurrenceFrequency,
        interval: Int = 1,
        endDate: Date? = nil,
        occurrenceCount: Int? = nil,
        daysOfWeek: [Int]? = nil,
        daysOfMonth: [Int]? = nil,
        monthsOfYear: [Int]? = nil
    ) {
        self.frequency = frequency
        self.interval = interval
        self.endDate = endDate
        self.occurrenceCount = occurrenceCount
        self.daysOfWeek = daysOfWeek
        self.daysOfMonth = daysOfMonth
        self.monthsOfYear = monthsOfYear
    }
    
    /// Convert to EKRecurrenceRule
    public func toEKRecurrenceRule() -> EKRecurrenceRule {
        let ekFrequency: EKRecurrenceFrequency
        switch frequency {
        case .daily:
            ekFrequency = .daily
        case .weekly:
            ekFrequency = .weekly
        case .monthly:
            ekFrequency = .monthly
        case .yearly:
            ekFrequency = .yearly
        }
        
        // Build days of week
        var ekDaysOfWeek: [EKRecurrenceDayOfWeek]?
        if let days = daysOfWeek {
            ekDaysOfWeek = days.map { EKRecurrenceDayOfWeek(EKWeekday(rawValue: $0)!) }
        }
        
        // Build days of month
        var ekDaysOfMonth: [NSNumber]?
        if let days = daysOfMonth {
            ekDaysOfMonth = days.map { NSNumber(value: $0) }
        }
        
        // Build months of year
        var ekMonthsOfYear: [NSNumber]?
        if let months = monthsOfYear {
            ekMonthsOfYear = months.map { NSNumber(value: $0) }
        }
        
        // Build recurrence end
        var recurrenceEnd: EKRecurrenceEnd?
        if let endDate = endDate {
            recurrenceEnd = EKRecurrenceEnd(end: endDate)
        } else if let count = occurrenceCount {
            recurrenceEnd = EKRecurrenceEnd(occurrenceCount: count)
        }
        
        return EKRecurrenceRule(
            recurrenceWith: ekFrequency,
            interval: interval,
            daysOfTheWeek: ekDaysOfWeek,
            daysOfTheMonth: ekDaysOfMonth,
            monthsOfTheYear: ekMonthsOfYear,
            weeksOfTheYear: nil,
            daysOfTheYear: nil,
            setPositions: nil,
            end: recurrenceEnd
        )
    }
    
    /// Create from EKRecurrenceRule
    public static func from(_ ekRule: EKRecurrenceRule) -> RecurrenceRule? {
        let frequency: RecurrenceFrequency
        switch ekRule.frequency {
        case .daily:
            frequency = .daily
        case .weekly:
            frequency = .weekly
        case .monthly:
            frequency = .monthly
        case .yearly:
            frequency = .yearly
        @unknown default:
            return nil
        }
        
        let daysOfWeek = ekRule.daysOfTheWeek?.map { $0.dayOfTheWeek.rawValue }
        let daysOfMonth = ekRule.daysOfTheMonth?.map { $0.intValue }
        let monthsOfYear = ekRule.monthsOfTheYear?.map { $0.intValue }
        
        let endDate = ekRule.recurrenceEnd?.endDate
        let occurrenceCount = ekRule.recurrenceEnd?.occurrenceCount
        
        return RecurrenceRule(
            frequency: frequency,
            interval: ekRule.interval,
            endDate: endDate,
            occurrenceCount: (occurrenceCount != nil && occurrenceCount! > 0) ? occurrenceCount : nil,
            daysOfWeek: daysOfWeek,
            daysOfMonth: daysOfMonth,
            monthsOfYear: monthsOfYear
        )
    }
}

