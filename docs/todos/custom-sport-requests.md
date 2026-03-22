# Custom Sport Requests

## What it does
Users can request a new sport type that isn't in the predefined list. Requests go into a queue for admin approval. Once approved, the sport becomes available to all users.

## Why it's valuable
Removes the limitation of a fixed sport list without letting the taxonomy become chaotic. Encourages community engagement and covers niche sports.

## Current state
For the interview challenge, `sport_types` has an open INSERT RLS policy allowing any authenticated user to create sport types directly (migration `00006_sporttype_create.sql`). This should be replaced with the admin approval flow below before production use.

## Implementation notes
- New table `sport_requests`: id, name, requested_by, status (pending/approved/rejected), created_at
- RLS: users can insert and read their own; admins can read/update all
- Replace the open INSERT policy on `sport_types` with admin-only insert
- Add an "Other -- Request new" option in the sport type select
- Server Action `requestSportType(name)` inserts a pending request
- Admin-only page at `/admin/sport-requests` to approve/reject
- On approval, insert into `sport_types` directly (no separate custom table needed)
- Notify the requesting user via toast on next login (or email if notifications are added)
