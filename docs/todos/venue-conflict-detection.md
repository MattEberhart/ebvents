# Venue Conflict Detection

## What it does
When creating or editing an event, the system checks whether the selected venue is already booked at the chosen date/time and warns the user about scheduling conflicts.

## Why it's valuable
Prevents double-booking of venues, which is a common real-world problem for sports event organizers. Builds trust that the platform manages logistics reliably.

## Implementation notes
- Add `start_time timestamptz` and `end_time timestamptz` columns to `events` (or derive from `event_date` + a new `duration_minutes integer` column)
- Server Action `checkVenueConflicts(venueId, startTime, endTime, excludeEventId?)` queries for overlapping events at the same venue
- SQL overlap check: `start_time < :end AND end_time > :start AND venue_id = :venueId`
- Call this action on the client when the user selects a venue and date/time, before form submission
- Display a warning banner (not a blocker) listing conflicting events with links
- Optionally make it a hard block if the venue creator has enabled "exclusive booking" mode
- Add a `venue_schedule` view or dedicated page showing a timeline of bookings per venue
- Consider adding a buffer time setting (e.g. 30 min between events for setup/teardown)
