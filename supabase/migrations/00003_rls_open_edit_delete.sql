-- Remove owner-only restrictions on events and venues
-- All authenticated users can now edit and delete any events/venues

-- Events: drop owner-only update/delete, replace with authenticated-only
drop policy if exists "Update events" on public.events;
drop policy if exists "Delete events" on public.events;

create policy "Update events" on public.events
  for update using (auth.role() = 'authenticated');

create policy "Delete events" on public.events
  for delete using (auth.role() = 'authenticated');

-- Venues: drop owner-only update, replace with authenticated-only
drop policy if exists "Update venues" on public.venues;

create policy "Update venues" on public.venues
  for update using (auth.role() = 'authenticated');

-- Also allow any authenticated user to delete venues
create policy "Delete venues" on public.venues
  for delete using (auth.role() = 'authenticated');

-- event_venues: drop owner-only manage, replace with authenticated-only
drop policy if exists "Manage event_venues" on public.event_venues;

create policy "Manage event_venues" on public.event_venues
  for all using (auth.role() = 'authenticated');
