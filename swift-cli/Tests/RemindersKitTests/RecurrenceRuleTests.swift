import EventKit
import Testing
@testable import RemindersKit

// These tests build EventKit objects in memory only. They never create an
// EKEventStore or touch real reminders, so they run without Reminders access.
@Suite("RecurrenceRule")
struct RecurrenceRuleTests {
    @Test("converts to an EKRecurrenceRule")
    func convertsToEKRecurrenceRule() {
        let rule = RecurrenceRule(frequency: .weekly, interval: 2, occurrenceCount: 5, daysOfWeek: [2, 4])

        let ekRule = rule.toEKRecurrenceRule()

        #expect(ekRule.frequency == .weekly)
        #expect(ekRule.interval == 2)
        #expect(ekRule.daysOfTheWeek?.map { $0.dayOfTheWeek.rawValue } == [2, 4])
        #expect(ekRule.recurrenceEnd?.occurrenceCount == 5)
    }

    @Test("round-trips through EKRecurrenceRule")
    func roundTrips() throws {
        let rule = RecurrenceRule(frequency: .monthly, daysOfMonth: [1, 15])

        let restored = try #require(RecurrenceRule.from(rule.toEKRecurrenceRule()))

        #expect(restored.frequency == .monthly)
        #expect(restored.interval == 1)
        #expect(restored.daysOfMonth == [1, 15])
        #expect(restored.occurrenceCount == nil)
    }
}
