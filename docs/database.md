# Database

Schema managed via Supabase CLI migrations in `supabase/migrations/`. Run with `supabase db push` or paste into the SQL editor.

## Tables

```sql
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Sport types reference table (FK, not a text enum)
create table public.sport_types (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

insert into public.sport_types (name, display_order) values
  ('Soccer', 1), ('Basketball', 2), ('Football', 3), ('Baseball', 4),
  ('Hockey', 5), ('Tennis', 6), ('Golf', 7), ('MMA', 8), ('Boxing', 9),
  ('Cricket', 10), ('Rugby', 11), ('Volleyball', 12), ('Swimming', 13),
  ('Track & Field', 14), ('Formula 1', 15), ('Esports', 16), ('Other', 99);

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text,
  last_name text,
  cf_image_id text,
  created_at timestamptz default now()
);

create table public.venues (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text,
  city text,
  state text,
  capacity integer,
  latitude double precision,
  longitude double precision,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  sport_type_id uuid references public.sport_types(id) not null,
  name text not null,
  starts_at timestamptz not null,
  duration_minutes integer not null default 60,
  description text,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.event_venues (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  venue_id uuid references public.venues(id) on delete cascade not null,
  unique(event_id, venue_id)
);
```

## Triggers

```sql
create or replace function public.handle_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger on_events_updated
  before update on public.events
  for each row execute procedure public.handle_updated_at();

create trigger on_venues_updated
  before update on public.venues
  for each row execute procedure public.handle_updated_at();

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Indexes

```sql
create index idx_events_sport_starts on public.events (sport_type_id, starts_at desc);
create index idx_events_name_trgm on public.events using gin (name gin_trgm_ops);
create index idx_events_user_id on public.events (user_id);
create index idx_events_created_at on public.events (created_at desc);
create index idx_venues_name_trgm on public.venues using gin (name gin_trgm_ops);
create index idx_event_venues_venue_id on public.event_venues (venue_id);
```

## Row Level Security

```sql
alter table public.sport_types enable row level security;
create policy "Read sport_types" on public.sport_types for select using (auth.role() = 'authenticated');

alter table public.profiles enable row level security;
create policy "Own profile read" on public.profiles for select using (auth.uid() = id);
create policy "Own profile update" on public.profiles for update using (auth.uid() = id);

alter table public.venues enable row level security;
create policy "Read venues" on public.venues for select using (auth.role() = 'authenticated');
create policy "Create venues" on public.venues for insert with check (auth.uid() = created_by);
create policy "Update venues" on public.venues for update using (auth.uid() = created_by);

alter table public.events enable row level security;
create policy "Read events" on public.events for select using (auth.role() = 'authenticated');
create policy "Create events" on public.events for insert with check (auth.uid() = user_id);
create policy "Update events" on public.events for update using (auth.uid() = user_id);
create policy "Delete events" on public.events for delete using (auth.uid() = user_id);

alter table public.event_venues enable row level security;
create policy "Read event_venues" on public.event_venues for select using (auth.role() = 'authenticated');
create policy "Manage event_venues" on public.event_venues for all using (
  exists (select 1 from public.events e where e.id = event_id and e.user_id = auth.uid())
);
```

## Supabase CLI workflow

```bash
# One-time setup
npx supabase init          # creates supabase/ directory
npx supabase link --project-ref <project-ref>

# Push migrations
npx supabase db push
```

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://your-vercel-url.vercel.app

# Cloudflare Images (avatar uploads)
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_IMAGES_API_TOKEN=
NEXT_PUBLIC_CF_ACCOUNT_HASH=
```

## Google OAuth (manual step)
1. Supabase dashboard > Authentication > Providers > Google > enable
2. Add Google client ID and secret
3. Add `https://[project-ref].supabase.co/auth/v1/callback` to Google Console redirect URIs
