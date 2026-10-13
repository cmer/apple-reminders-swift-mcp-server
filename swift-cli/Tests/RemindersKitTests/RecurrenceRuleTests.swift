import EventKit
import Foundation
import Testing
@testable import RemindersKit

// These tests build EventKit objects in memory only. They never save anything or
// request access, so they run without Reminders access.

/// The message of the error `body` throws, or nil if it doesn't throw.
private func errorMessage(_ body: () throws -> Void) -> String? {
    do {
        try body()
        return nil
    } catch let error as ReminderError {
        return error.description
    } catch {
        return "unexpected error: \(error)"
    }
}

@Suite("Weekday")
struct WeekdayTests {
    @Test("names map to EventKit raw values, 1 = Sunday through 7 = Saturday")
    func namesMapToRawValues() {
        let expected: [(String, Int)] = [
            ("sunday", 1), ("monday", 2), ("tuesday", 3), ("wednesday", 4),
            ("thursday", 5), ("friday", 6), ("saturday", 7),
        ]
        for (name, rawValue) in expected {
            let weekday = Weekday(name: name)
            #expect(weekday?.ekWeekday.rawValue == rawValue)
            #expect(weekday.flatMap { Weekday(ekWeekday: $0.ekWeekday) } == weekday)
            #expect(weekday?.rawValue == name)
        }
    }

    @Test("only full lowercase names are accepted")
    func rejectsOtherSpellings() {
        for name in ["mon", "Monday", "MONDAY", "someday", "", "2"] {
            #expect(Weekday(name: name) == nil)
        }
    }
}

@Suite("RecurrenceRule to EventKit")
struct RecurrenceRuleToEventKitTests {
    @Test("daily")
    func daily() throws {
        let ekRule = try RecurrenceRule(frequency: .daily, interval: 3).toEKRecurrenceRule()

        #expect(ekRule.frequency == .daily)
        #expect(ekRule.interval == 3)
        #expect(ekRule.daysOfTheWeek == nil)
        #expect(ekRule.recurrenceEnd == nil)
    }

    @Test("weekly with weekdays")
    func weeklyWithDays() throws {
        let rule = RecurrenceRule(frequency: .weekly, interval: 2, daysOfWeek: ["monday", "wednesday"])

        let ekRule = try rule.toEKRecurrenceRule()

        #expect(ekRule.frequency == .weekly)
        #expect(ekRule.interval == 2)
        #expect(ekRule.daysOfTheWeek?.map { $0.dayOfTheWeek.rawValue } == [2, 4])
        #expect(ekRule.daysOfTheWeek?.map { $0.weekNumber } == [0, 0])
    }

    @Test("weekly without weekdays leaves the day to the due date")
    func weeklyWithoutDays() throws {
        let ekRule = try RecurrenceRule(frequency: .weekly).toEKRecurrenceRule()

        #expect(ekRule.frequency == .weekly)
        #expect(ekRule.interval == 1)
        #expect(ekRule.daysOfTheWeek == nil)
    }

    @Test("repeated weekdays are written once")
    func dedupesWeekdays() throws {
        let rule = RecurrenceRule(frequency: .weekly, daysOfWeek: ["friday", "friday"])

        #expect(try rule.toEKRecurrenceRule().daysOfTheWeek?.count == 1)
    }

    @Test("refuses an invalid rule instead of handing EventKit a value that raises")
    func refusesInvalidRule() {
        let rule = RecurrenceRule(frequency: .daily, interval: 0)

        #expect(errorMessage { _ = try rule.toEKRecurrenceRule() } != nil)
    }
}

@Suite("EventKit to RecurrenceRule")
struct RecurrenceRuleFromEventKitTests {
    @Test("daily")
    func daily() {
        let ekRule = EKRecurrenceRule(recurrenceWith: .daily, interval: 3, end: nil)

        #expect(RecurrenceRule.from(ekRule) == RecurrenceRule(frequency: .daily, interval: 3))
    }

    @Test("weekly with weekdays")
    func weeklyWithDays() {
        let ekRule = EKRecurrenceRule(
            recurrenceWith: .weekly,
            interval: 2,
            daysOfTheWeek: [EKRecurrenceDayOfWeek(.monday), EKRecurrenceDayOfWeek(.wednesday)],
            daysOfTheMonth: nil,
            monthsOfTheYear: nil,
            weeksOfTheYear: nil,
            daysOfTheYear: nil,
            setPositions: nil,
            end: nil
        )

        #expect(
            RecurrenceRule.from(ekRule)
                == RecurrenceRule(frequency: .weekly, interval: 2, daysOfWeek: ["monday", "wednesday"])
        )
    }

    @Test("weekly without weekdays")
    func weeklyWithoutDays() {
        let ekRule = EKRecurrenceRule(recurrenceWith: .weekly, interval: 1, end: nil)

        #expect(RecurrenceRule.from(ekRule) == RecurrenceRule(frequency: .weekly))
    }

    @Test("round-trips daily and weekly rules")
    func roundTrips() throws {
        let rules = [
            RecurrenceRule(frequency: .daily),
            RecurrenceRule(frequency: .daily, interval: 5),
            RecurrenceRule(frequency: .weekly, interval: 4),
            RecurrenceRule(frequency: .weekly, daysOfWeek: ["sunday", "saturday"]),
        ]
        for rule in rules {
            #expect(RecurrenceRule.from(try rule.toEKRecurrenceRule()) == rule)
        }
    }

    @Test("rules this ticket can't express map to nil without crashing")
    func unmappedRulesAreNil() {
        let monday = EKRecurrenceDayOfWeek(.monday)
        let firstMonday = EKRecurrenceDayOfWeek(.monday, weekNumber: 1)
        let rules = [
            // daily with weekdays
            EKRecurrenceRule(
                recurrenceWith: .daily, interval: 1, daysOfTheWeek: [monday], daysOfTheMonth: nil,
                monthsOfTheYear: nil, weeksOfTheYear: nil, daysOfTheYear: nil, setPositions: nil, end: nil),
            // weekly with an ordinal weekday
            EKRecurrenceRule(
                recurrenceWith: .weekly, interval: 1, daysOfTheWeek: [firstMonday], daysOfTheMonth: nil,
                monthsOfTheYear: nil, weeksOfTheYear: nil, daysOfTheYear: nil, setPositions: nil, end: nil),
            // weekly with set positions
            EKRecurrenceRule(
                recurrenceWith: .weekly, interval: 1, daysOfTheWeek: [monday], daysOfTheMonth: nil,
                monthsOfTheYear: nil, weeksOfTheYear: nil, daysOfTheYear: nil, setPositions: [1], end: nil),
            // monthly on days of the month
            EKRecurrenceRule(
                recurrenceWith: .monthly, interval: 1, daysOfTheWeek: nil, daysOfTheMonth: [1, 15],
                monthsOfTheYear: nil, weeksOfTheYear: nil, daysOfTheYear: nil, setPositions: nil, end: nil),
            // weekly with an end
            EKRecurrenceRule(recurrenceWith: .weekly, interval: 1, end: EKRecurrenceEnd(occurrenceCount: 3)),
        ]
        for rule in rules {
            #expect(RecurrenceRule.from(rule) == nil)
        }
    }
}

@Suite("RecurrenceRule validation")
struct RecurrenceRuleValidationTests {
    @Test("accepts valid daily and weekly rules")
    func acceptsValid() throws {
        try RecurrenceRule(frequency: .daily).validate()
        try RecurrenceRule(frequency: .weekly, interval: 2, daysOfWeek: ["monday"]).validate()
    }

    @Test("rejects an interval below 1")
    func rejectsBadInterval() {
        for interval in [0, -1, Int.min] {
            let message = errorMessage { try RecurrenceRule(frequency: .daily, interval: interval).validate() }
            #expect(message == "interval must be a whole number, 1 or greater")
        }
    }

    @Test("rejects unknown weekday names")
    func rejectsUnknownWeekday() {
        for name in ["mon", "Monday", "someday"] {
            let rule = RecurrenceRule(frequency: .weekly, daysOfWeek: ["tuesday", name])
            #expect(
                errorMessage { try rule.validate() }
                    == "daysOfWeek must use full lowercase weekday names: sunday, monday, tuesday, wednesday, thursday, friday, saturday"
            )
        }
    }

    @Test("rejects daysOfWeek on anything but weekly")
    func rejectsDaysOfWeekOffWeekly() {
        for frequency in [RecurrenceFrequency.daily, .monthly, .yearly] {
            let rule = RecurrenceRule(frequency: frequency, daysOfWeek: ["monday"])
            #expect(errorMessage { try rule.validate() } == "daysOfWeek only applies to weekly rules")
        }
    }

    @Test("rejects an empty daysOfWeek")
    func rejectsEmptyDaysOfWeek() {
        let rule = RecurrenceRule(frequency: .weekly, daysOfWeek: [])

        #expect(
            errorMessage { try rule.validate() }
                == "daysOfWeek can't be empty: omit it to repeat on the due date's weekday"
        )
    }

    @Test("a rule without a due date is rejected")
    func rejectsMissingDueDate() throws {
        let rule = RecurrenceRule(frequency: .weekly)

        #expect(
            errorMessage { try rule.validate(dueDate: nil) }
                == "A recurring reminder needs a due date: pass dueDate as the first occurrence."
        )
        try rule.validate(dueDate: "2026-10-19T14:30:00Z")
    }

    @Test("a bad rule is reported before the missing due date")
    func ruleErrorsComeFirst() {
        let rule = RecurrenceRule(frequency: .daily, interval: 0)

        #expect(errorMessage { try rule.validate(dueDate: nil) } == "interval must be a whole number, 1 or greater")
    }
}

@Suite("RecurrenceRule JSON")
struct RecurrenceRuleJSONTests {
    private func decode(_ json: String) throws -> RecurrenceRule {
        try JSONDecoder().decode(RecurrenceRule.self, from: Data(json.utf8))
    }

    @Test("interval defaults to 1")
    func intervalDefaults() throws {
        #expect(try decode(#"{"frequency":"daily"}"#) == RecurrenceRule(frequency: .daily))
    }

    @Test("decodes weekday names")
    func decodesWeekdays() throws {
        let rule = try decode(#"{"frequency":"weekly","interval":2,"daysOfWeek":["monday","wednesday"]}"#)

        #expect(rule == RecurrenceRule(frequency: .weekly, interval: 2, daysOfWeek: ["monday", "wednesday"]))
    }

    @Test("an unknown weekday decodes, then fails validation with a specific message")
    func unknownWeekdayFailsValidation() throws {
        let rule = try decode(#"{"frequency":"weekly","daysOfWeek":["someday"]}"#)

        #expect(errorMessage { try rule.validate() }?.hasPrefix("daysOfWeek must use full lowercase") == true)
    }

    @Test("encodes only the fields that apply")
    func encodesCompactly() throws {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        let json = try encoder.encode(RecurrenceRule(frequency: .weekly, interval: 2, daysOfWeek: ["monday"]))

        #expect(String(decoding: json, as: UTF8.self) == #"{"daysOfWeek":["monday"],"frequency":"weekly","interval":2}"#)
    }
}

@Suite("Reminder recurrence")
struct ReminderRecurrenceTests {
    private func ekReminder(rules: [EKRecurrenceRule], due: DateComponents?) -> EKReminder {
        let reminder = EKReminder(eventStore: EKEventStore())
        reminder.title = "Gym"
        reminder.dueDateComponents = due
        for rule in rules { reminder.addRecurrenceRule(rule) }
        return reminder
    }

    private func encode(_ reminder: Reminder) throws -> [String: Any] {
        let data = try JSONEncoder().encode(reminder)
        return try #require(try JSONSerialization.jsonObject(with: data) as? [String: Any])
    }

    @Test("a recurring reminder carries its rule and whether the due date has a time")
    func carriesRule() throws {
        let rule = EKRecurrenceRule(recurrenceWith: .daily, interval: 2, end: nil)
        let due = DateComponents(calendar: .current, year: 2026, month: 10, day: 19, hour: 14, minute: 30)

        let reminder = Reminder(from: ekReminder(rules: [rule], due: due))

        #expect(reminder.recurrence == RecurrenceRule(frequency: .daily, interval: 2))
        #expect(reminder.hasRecurrenceRules)
        #expect(reminder.dueDateHasTime)
    }

    @Test("a date-only due date has no time")
    func dateOnlyDueDate() {
        let due = DateComponents(calendar: .current, year: 2026, month: 10, day: 19)

        let reminder = Reminder(from: ekReminder(rules: [], due: due))

        #expect(reminder.dueDate != nil)
        #expect(!reminder.dueDateHasTime)
    }

    @Test("no due date means no time")
    func noDueDate() {
        #expect(!Reminder(from: ekReminder(rules: [], due: nil)).dueDateHasTime)
    }

    @Test("a rule that can't be mapped reads as nil but still counts as having rules")
    func unmappedRule() {
        let rule = EKRecurrenceRule(recurrenceWith: .weekly, interval: 1, end: EKRecurrenceEnd(occurrenceCount: 3))

        let reminder = Reminder(from: ekReminder(rules: [rule], due: DateComponents(calendar: .current, year: 2026, month: 10, day: 19)))

        #expect(reminder.recurrence == nil)
        #expect(reminder.hasRecurrenceRules)
    }

    @Test("more than one rule reads as nil")
    func severalRules() {
        let rules = [
            EKRecurrenceRule(recurrenceWith: .daily, interval: 1, end: nil),
            EKRecurrenceRule(recurrenceWith: .weekly, interval: 1, end: nil),
        ]

        let reminder = Reminder(from: ekReminder(rules: rules, due: DateComponents(calendar: .current, year: 2026, month: 10, day: 19)))

        #expect(reminder.recurrence == nil)
    }

    @Test("JSON has recurrence as the rule object or null, plus dueDateHasTime")
    func jsonShape() throws {
        let plain = try encode(Reminder(from: ekReminder(rules: [], due: nil)))
        #expect(plain["recurrence"] is NSNull)
        #expect(plain["dueDateHasTime"] as? Bool == false)
        #expect(plain["hasRecurrenceRules"] as? Bool == false)

        let rule = EKRecurrenceRule(recurrenceWith: .daily, interval: 1, end: nil)
        let recurring = try encode(Reminder(from: ekReminder(rules: [rule], due: DateComponents(calendar: .current, year: 2026, month: 10, day: 19, hour: 9))))
        let object = try #require(recurring["recurrence"] as? [String: Any])
        #expect(object["frequency"] as? String == "daily")
        #expect(object["interval"] as? Int == 1)
    }
}
