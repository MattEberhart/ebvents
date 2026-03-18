# Custom Sport Requests

## What it does
Users can request a new sport type that isn't in the predefined list. Requests go into a queue for admin approval. Once approved, the sport becomes available to all users.

## Why it's valuable
Removes the limitation of a fixed sport list without letting the taxonomy become chaotic. Encourages community engagement and covers niche sports.

## Implementation notes
- New table `sport_requests`: id, name, requested_by, status (pending/approved/rejected), created_at
- RLS: users can insert and read their own; admins can read/update all
- Add an "Other -- Request new" option in the sport type select
- Server Action `requestSportType(name)` inserts a pending request
- Admin-only page at `/admin/sport-requests` to approve/reject
- On approval, add the sport to a `custom_sports` table or a config row
- Update `SPORT_TYPES` to merge hardcoded + approved custom sports at runtime
- Notify the requesting user via toast on next login (or email if notifications are added)
