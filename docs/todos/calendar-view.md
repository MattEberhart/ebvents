# Calendar View

## What it does
An alternative calendar visualization of events, supporting monthly and weekly views. Users can click a date to see events or create a new one.

## Why it's valuable
Calendar layouts are the most intuitive way to browse time-based data. Helps users spot scheduling gaps and conflicts at a glance.

## Implementation notes
- Add a view toggle (grid / calendar) on the dashboard, persisted as a URL param `view=calendar`
- Use a library like `@fullcalendar/react` or build a lightweight custom calendar grid
- Monthly view: render event dots/chips on each day cell; click to expand
- Weekly view: time-slot rows with event blocks, useful for seeing time-of-day distribution
- Fetch events for the visible date range only via `getEvents({ from, to })` -- add date range params to the action
- Sport-type color coding on calendar entries (reuse badge color mapping)
- Mobile: default to weekly view for better usability on small screens
- "Create event" shortcut: clicking an empty date cell navigates to `/events/new?date=YYYY-MM-DD`
