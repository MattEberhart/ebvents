# Draft Events

## What it does
Users can save incomplete events as drafts. Drafts appear in a separate "Drafts" tab on the dashboard and can be resumed and published later.

## Why it's valuable
Prevents data loss when users are interrupted mid-creation. Lowers the barrier to start creating an event since not all fields are required upfront.

## Implementation notes
- Add `status text default 'published'` column to `events` table (values: `draft`, `published`)
- Relax zod validation for drafts: only `name` is required, other fields become optional
- Add a "Save as Draft" button alongside the existing "Create Event" submit button
- Server Action `saveDraft(values)` inserts with `status = 'draft'`
- Dashboard filter: default view shows only published events; a "Drafts" tab shows drafts
- RLS: drafts are only visible to the owning user (add `status = 'draft' and user_id = auth.uid()` policy)
- Editing a draft and submitting sets `status = 'published'`
- Auto-save drafts every 30 seconds using a debounced client-side interval calling `saveDraft`
