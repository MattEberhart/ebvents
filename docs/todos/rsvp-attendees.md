# RSVP / Attendees

## What it does
Users can RSVP to events (going / maybe / not going). Event creators see an attendee list with counts. Capacity warnings appear when a venue is near or at capacity.

## Why it's valuable
Transforms the app from a personal event tracker into a social coordination tool. Capacity awareness prevents overbooking.

## Implementation notes
- New table `rsvps`: id, event_id, user_id, status (going/maybe/declined), created_at; unique(event_id, user_id)
- RLS: authenticated users can insert/update their own RSVP; all authenticated users can read RSVPs
- Server Actions: `rsvpToEvent(eventId, status)`, `getEventAttendees(eventId)`
- RSVP buttons on event detail page (three-state toggle)
- Show attendee count badge on event cards: "5 going, 2 maybe"
- Capacity warning: if `going` count >= venue capacity, show an orange warning badge
- At capacity: disable RSVP "going" button, show "Event full" message
- Event creator can see full attendee list with names on the event detail page
