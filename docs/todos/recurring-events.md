# Recurring Events

## What it does
Users can create events with repeat rules (daily, weekly, biweekly, monthly) that automatically generate future occurrences.

## Why it's valuable
Most sports events are recurring (weekly pickup games, monthly tournaments). Without this, users must manually recreate the same event repeatedly.

## Implementation notes
- Add columns to `events`: `recurrence_rule text` (e.g. `FREQ=WEEKLY;BYDAY=SA`), `recurrence_end timestamptz`, `parent_event_id uuid` (self-reference for series)
- Store the rule in iCal RRULE format for interoperability
- On create: if a recurrence rule is set, generate occurrence rows up to `recurrence_end` (or a max horizon like 3 months)
- Link occurrences via `parent_event_id` so editing the series updates all future instances
- Support "edit this event only" vs "edit all future events" (detach or cascade)
- Add recurrence fields to `eventSchema` and the EventForm UI (frequency select + end date picker)
- Background job consideration: for long-running series, use a Supabase Edge Function or cron to generate new occurrences as the horizon approaches
- Deleting the parent event deletes all linked occurrences (cascade via FK)
