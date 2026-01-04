import Foundation
import RemindersKit

/// Command router - routes CLI commands to appropriate handlers
class CommandRouter {
    private let reminderManager = ReminderManager()
    private let listManager = ListManager()
    
    /// Route a command with JSON input
    func route(command: String, jsonInput: String) async throws -> String {
        switch command {
        case "create-reminder":
            return try await handleCreateReminder(jsonInput: jsonInput)
        case "get-reminder":
            return try await handleGetReminder(jsonInput: jsonInput)
        case "list-reminders":
            return try await handleListReminders(jsonInput: jsonInput)
        case "complete-reminder":
            return try await handleCompleteReminder(jsonInput: jsonInput)
        case "delete-reminder":
            return try await handleDeleteReminder(jsonInput: jsonInput)
        case "get-all-lists":
            return try handleGetAllLists()
        default:
            throw CLIError(
                code: "UNKNOWN_COMMAND",
                message: "Unknown command: \(command)"
            )
        }
    }
    
    // MARK: - Command Handlers
    
    private func handleCreateReminder(jsonInput: String) throws -> String {
        let input = try decodeInput(CreateReminderInput.self, from: jsonInput)
        let reminder = try reminderManager.createReminder(input: input)
        let response = CLIResponse(success: true, data: reminder)
        return try encodeResponse(response)
    }
    
    private func handleGetReminder(jsonInput: String) throws -> String {
        struct GetReminderInput: Codable {
            let id: String
        }
        
        let input = try decodeInput(GetReminderInput.self, from: jsonInput)
        
        guard let reminder = try reminderManager.getReminder(id: input.id) else {
            throw ReminderError.reminderNotFound(input.id)
        }
        
        let response = CLIResponse(success: true, data: reminder)
        return try encodeResponse(response)
    }
    
    private func handleListReminders(jsonInput: String) async throws -> String {
        struct ListRemindersInput: Codable {
            let completed: Bool?
        }
        
        let input = try decodeInput(ListRemindersInput.self, from: jsonInput)
        let reminders = try await reminderManager.getAllReminders(completed: input.completed)
        let response = CLIResponse(success: true, data: reminders)
        return try encodeResponse(response)
    }
    
    private func handleCompleteReminder(jsonInput: String) throws -> String {
        struct CompleteReminderInput: Codable {
            let id: String
        }
        
        let input = try decodeInput(CompleteReminderInput.self, from: jsonInput)
        let reminder = try reminderManager.completeReminder(id: input.id)
        let response = CLIResponse(success: true, data: reminder)
        return try encodeResponse(response)
    }
    
    private func handleDeleteReminder(jsonInput: String) throws -> String {
        struct DeleteReminderInput: Codable {
            let id: String
        }
        
        let input = try decodeInput(DeleteReminderInput.self, from: jsonInput)
        try reminderManager.deleteReminder(id: input.id)
        
        struct DeleteResponse: Codable {
            let deleted: Bool
            let id: String
        }
        
        let response = CLIResponse(success: true, data: DeleteResponse(deleted: true, id: input.id))
        return try encodeResponse(response)
    }
    
    private func handleGetAllLists() throws -> String {
        let lists = listManager.getAllLists()
        let response = CLIResponse(success: true, data: lists)
        return try encodeResponse(response)
    }
    
    // MARK: - Helpers
    
    private func decodeInput<T: Decodable>(_ type: T.Type, from jsonString: String) throws -> T {
        guard let jsonData = jsonString.data(using: .utf8) else {
            throw CLIError(code: "INVALID_JSON", message: "Invalid JSON input")
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        do {
            return try decoder.decode(type, from: jsonData)
        } catch {
            throw CLIError(
                code: "JSON_DECODE_ERROR",
                message: "Failed to decode JSON: \(error.localizedDescription)"
            )
        }
    }
    
    private func encodeResponse<T: Encodable>(_ response: T) throws -> String {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        
        let jsonData = try encoder.encode(response)
        guard let jsonString = String(data: jsonData, encoding: .utf8) else {
            throw CLIError(code: "ENCODING_ERROR", message: "Failed to encode response")
        }
        
        return jsonString
    }
}

/// CLI Error type
struct CLIError: Error, CustomStringConvertible {
    let code: String
    let message: String
    
    var description: String {
        return message
    }
}

