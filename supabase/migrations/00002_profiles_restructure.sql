-- Restructure profiles: split name, remove email, switch to CF image IDs
-- No users exist yet, so safe to drop columns without data loss.

-- 1. Add new columns
alter table public.profiles add column first_name text;
alter table public.profiles add column last_name text;
alter table public.profiles add column cf_image_id text;

-- 2. Drop old columns
alter table public.profiles drop column email;
alter table public.profiles drop column full_name;
alter table public.profiles drop column avatar_url;

-- 3. Replace trigger to match new columns
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'given_name'),
    coalesce(new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'family_name')
  );
  return new;
end;
$$ language plpgsql security definer;
