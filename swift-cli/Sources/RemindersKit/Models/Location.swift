import Foundation
import EventKit
import CoreLocation

/// Location for location-based reminders
public struct ReminderLocation: Codable {
    public let title: String?
    public let latitude: Double
    public let longitude: Double
    public let radius: Double // in meters
    public let proximity: LocationProximity
    
    public init(
        title: String? = nil,
        latitude: Double,
        longitude: Double,
        radius: Double = 100.0,
        proximity: LocationProximity = .enter
    ) {
        self.title = title
        self.latitude = latitude
        self.longitude = longitude
        self.radius = radius
        self.proximity = proximity
    }
    
    /// Convert to EKStructuredLocation
    public func toEKStructuredLocation() -> EKStructuredLocation {
        let location = EKStructuredLocation(title: title ?? "Location")
        location.geoLocation = CLLocation(latitude: latitude, longitude: longitude)
        location.radius = radius
        return location
    }
    
    /// Create from EKStructuredLocation
    public static func from(_ ekLocation: EKStructuredLocation) -> ReminderLocation? {
        guard let geoLocation = ekLocation.geoLocation else { return nil }
        
        return ReminderLocation(
            title: ekLocation.title,
            latitude: geoLocation.coordinate.latitude,
            longitude: geoLocation.coordinate.longitude,
            radius: ekLocation.radius,
            proximity: .enter // Default, as EKAlarm stores the proximity
        )
    }
}

/// Location proximity trigger type
public enum LocationProximity: String, Codable {
    case enter // Trigger when arriving
    case leave // Trigger when leaving
}

