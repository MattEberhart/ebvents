# User Profile

## What it does
A dedicated profile page where users can view and edit their display name, upload an avatar, and manage account settings like email and password.

## Why it's valuable
Personalizes the experience and gives users ownership of their identity in the app. Required foundation for any social or collaborative features.

## Current state
- `profiles` table has `first_name`, `last_name`, `cf_image_id` columns (no `email` or `full_name`)
- Trigger populates `first_name`/`last_name` from metadata on signup (email: `first_name`/`last_name`, Google: `given_name`/`family_name`)
- Avatar upload via Cloudflare Images Direct Creator Upload (no Route Handler needed)
- `getAvatarUrl()` in `lib/cloudflare.ts` falls back to Google OAuth `avatar_url` from `user.user_metadata`
- `AvatarUpload` component in dashboard header allows clickable avatar upload
- "Hi, {first_name}" greeting in dashboard header

## Remaining work
- New page at `app/(dashboard)/profile/page.tsx` with full profile edit form
- Password change: call `supabase.auth.updateUser({ password })` in a Server Action
- Show user's event count and join date on the profile page
- Avatar crop/resize before upload (currently uploads raw file)
- RLS: users can update only their own profile row (already in place)
