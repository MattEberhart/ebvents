# Creator Attribution + Contact Form

## What it does
Events and venues display who created them (name + avatar). Other authenticated users can open a contact form to message the creator directly, without exposing email addresses.

## Why it's valuable
Knowing who posted an event builds trust and accountability. A contact form lets users ask questions ("Is parking free?", "Can I bring a guest?") without needing a full messaging system. Keeping emails private respects creator privacy while still enabling communication.

## Implementation notes
- Join `profiles` on `events.user_id` and `venues.created_by` to surface creator name + avatar on detail pages and cards
- New "Created by" line on EventCard and VenueCard showing the creator's name and avatar (or initials fallback)
- On event/venue detail pages, show a "Contact organizer" button for non-creators
- Button opens a dialog with a simple form: subject (pre-filled with event/venue name), message body (textarea, max 1000 chars)
- New table `contact_messages`: id, sender_id (FK auth.users), recipient_id (FK auth.users), event_id (nullable FK events), venue_id (nullable FK venues), subject, body, created_at
- RLS: authenticated users can insert messages where sender_id = auth.uid(); recipients can read messages where recipient_id = auth.uid()
- Server Action: `sendContactMessage(recipientId, { subject, body, eventId?, venueId? })`
- Toast confirmation on send: "Message sent to [name]"
- Future enhancement: email notification to the recipient via Supabase Edge Function or webhook
- Future enhancement: inbox page where users can view and reply to received messages
