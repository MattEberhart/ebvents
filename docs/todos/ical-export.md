# iCal Export

## What it does
Users can export individual events or their full event list as `.ics` files compatible with Google Calendar, Apple Calendar, and Outlook.

## Why it's valuable
Bridges the app with users' existing calendar workflows. Makes it easy to get reminders and share events outside the platform.

## Implementation notes
- Use the `ics` npm package to generate iCal-formatted strings
- Route Handler at `app/api/events/[id]/ical/route.ts` (exception to actions-only rule, since it returns a file download)
- Set response headers: `Content-Type: text/calendar`, `Content-Disposition: attachment; filename="event.ics"`
- Map event fields: name -> SUMMARY, description -> DESCRIPTION, event_date -> DTSTART, venue -> LOCATION
- "Add to Calendar" button on event detail page that triggers the download
- Bulk export: `/api/events/export` returns all of the user's events as a single `.ics` file
- Include VTIMEZONE component for proper timezone handling
- Authenticate the request via Supabase session cookie check in the route handler
