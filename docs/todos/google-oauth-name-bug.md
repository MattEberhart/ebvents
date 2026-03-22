# Bug: Google OAuth Users Missing First/Last Name

## What's broken
When a user signs up via Google OAuth, their `first_name` and `last_name` in the `profiles` table are NULL. Email/password signups work fine.

## Root cause
The `handle_new_user` trigger (migration 00002) extracts names from `raw_user_meta_data` using keys `first_name` → `given_name` and `last_name` → `family_name`. Email/password signup sets `first_name`/`last_name` explicitly via `options.data`, so the first coalesce branch hits. But Google OAuth through Supabase populates `full_name` (a single combined string) — neither `given_name` nor `family_name` are guaranteed as separate keys, so both coalesce expressions return NULL.

## Fix
- Migration 00006: replace the trigger function to add a third coalesce fallback that splits `full_name` on the first space
- Backfill existing Google OAuth users from `auth.users.raw_user_meta_data->>'full_name'`
