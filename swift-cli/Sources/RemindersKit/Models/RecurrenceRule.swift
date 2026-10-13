import Foundation
import EventKit

/// Recurrence frequency for recurring reminders
public enum RecurrenceFrequency: String, Codable {
    case daily
    case weekly
    case monthly
    case yearly
}

/// A weekday, spelled as on the wire: full lowercase English names.
/// EventKit's raw values run 1 = Sunday through 7 = Saturday.
public enum Weekday: String, Codable, CaseIterable {
    case sunday
    case monday
    case tuesday
    case wednesday
    case thursday
    case friday
    case saturday

    /// The weekday for a wire name, or nil if it isn't a full lowercase weekday name
    public init?(name: String) {
        self.init(rawValue: name)
    }

    public init?(ekWeekday: EKWeekday) {
        switch ekWeekday {
        case .sunday: self = .sunday
        case .monday: self = .monday
        case .tuesday: self = .tuesday
        case .wednesday: self = .wednesday
        case .thursday: self = .thursday
        case .friday: self = .friday
        case .saturday: self = .saturday
        @unknown default: return nil
        }
    }

    public var ekWeekday: EKWeekday {
        switch self {
        case .sunday: return .sunday
        case .monday: return .monday
        case .tuesday: return .tuesday
        case .wednesday: return .wednesday
        case .thursday: return .thursday
        case .friday: return .friday
        case .saturday: return .saturday
        }
    }
}

/// The recurrence rule of a recurring reminder, in the shape used on the wire for both input
/// (create) and output (reads).
///
/// Always call `validate()` (or `toEKRecurrenceRule()`, which does) before handing anything to
/// EventKit: a bad interval or weekday makes EventKit raise an Objective-C exception, which Swift
/// can't catch, and that crashes the CLI.
public struct RecurrenceRule: Codable, Equatable {
    public let frequency: RecurrenceFrequency
    public let interval: Int // e.g., every 2 weeks; at least 1
    /// Weekly only. Full lowercase weekday names, kept as strings so an unknown name survives
    /// decoding and `validate()` can reject it with a message that names it.
    public let daysOfWeek: [String]?

    public init(
        frequency: RecurrenceFrequency,
        interval: Int = 1,
        daysOfWeek: [String]? = nil
    ) {
        self.frequency = frequency
        self.interval = interval
        self.daysOfWeek = daysOfWeek
    }

    private enum CodingKeys: String, CodingKey {
        case frequency, interval, daysOfWeek
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.frequency = try container.decode(RecurrenceFrequency.self, forKey: .frequency)
        self.interval = try container.decodeIfPresent(Int.self, forKey: .interval) ?? 1
        self.daysOfWeek = try container.decodeIfPresent([String].self, forKey: .daysOfWeek)
    }

    // MARK: - Validation

    public static let needsDueDateMessage =
        "A recurring reminder needs a due date: pass dueDate as the first occurrence."

    /// Check the rule, throwing `ReminderError.invalidInput` with an agent-readable message.
    /// Keep the messages in step with the Zod schema in src/validation/reminder-schemas.ts.
    public func validate() throws {
        if interval < 1 {
            throw ReminderError.invalidInput("interval must be a whole number, 1 or greater")
        }

        if let daysOfWeek = daysOfWeek {
            if frequency != .weekly {
                throw ReminderError.invalidInput("daysOfWeek only applies to weekly rules")
            }
            if daysOfWeek.isEmpty {
                throw ReminderError.invalidInput(
                    "daysOfWeek can't be empty: omit it to repeat on the due date's weekday"
                )
            }
            if daysOfWeek.contains(where: { Weekday(name: $0) == nil }) {
                let names = Weekday.allCases.map { $0.rawValue }.joined(separator: ", ")
                throw ReminderError.invalidInput(
                    "daysOfWeek must use full lowercase weekday names: \(names)"
                )
            }
        }
    }

    /// Check the rule, then check that the reminder it goes on has a due date.
    /// - Parameter dueDate: The reminder's due date input, if any
    public func validate(dueDate: String?) throws {
        try validate()
        if dueDate == nil {
            throw ReminderError.invalidInput(Self.needsDueDateMessage)
        }
    }

    // MARK: - EventKit

    /// Convert to EKRecurrenceRule, validating first
    public func toEKRecurrenceRule() throws -> EKRecurrenceRule {
        try validate()

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

        var ekDaysOfWeek: [EKRecurrenceDayOfWeek]?
        if let daysOfWeek = daysOfWeek {
            var seen = Set<Weekday>()
            ekDaysOfWeek = daysOfWeek
                .compactMap { Weekday(name: $0) }
                .filter { seen.insert($0).inserted }
                .map { EKRecurrenceDayOfWeek($0.ekWeekday) }
        }

        return EKRecurrenceRule(
            recurrenceWith: ekFrequency,
            interval: interval,
            daysOfTheWeek: ekDaysOfWeek,
            daysOfTheMonth: nil,
            monthsOfTheYear: nil,
            weeksOfTheYear: nil,
            daysOfTheYear: nil,
            setPositions: nil,
            end: nil
        )
    }

    /// Create from EKRecurrenceRule.
    ///
    /// Returns nil for a rule this model can't express exactly. Never approximates: a rule that
    /// reads back as something it isn't would be silently rewritten by a later update.
    public static func from(_ ekRule: EKRecurrenceRule) -> RecurrenceRule? {
        // Anything the model has no field for means the rule isn't exactly what we'd report.
        guard ekRule.recurrenceEnd == nil,
              (ekRule.daysOfTheMonth ?? []).isEmpty,
              (ekRule.monthsOfTheYear ?? []).isEmpty,
              (ekRule.weeksOfTheYear ?? []).isEmpty,
              (ekRule.daysOfTheYear ?? []).isEmpty,
              (ekRule.setPositions ?? []).isEmpty
        else {
            return nil
        }

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

        let ekDays = ekRule.daysOfTheWeek ?? []
        if frequency != .weekly && !ekDays.isEmpty {
            return nil
        }

        var daysOfWeek: [String]?
        if !ekDays.isEmpty {
            var names: [String] = []
            for day in ekDays {
                // An ordinal weekday ("first Monday") is a different pattern.
                guard day.weekNumber == 0, let weekday = Weekday(ekWeekday: day.dayOfTheWeek) else {
                    return nil
                }
                names.append(weekday.rawValue)
            }
            daysOfWeek = names
        }

        return RecurrenceRule(frequency: frequency, interval: ekRule.interval, daysOfWeek: daysOfWeek)
    }
}
