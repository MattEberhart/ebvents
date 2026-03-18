# Architecture Decisions

Documenting the key decisions and trade-offs weighed during the design of Ebvents.

---

## 1. `starts_at` + `duration_minutes` vs. `starts_at` + `ends_at`

**Decision:** `starts_at` (timestamptz) + `duration_minutes` (integer, default 60)

**Trade-off:** Storing an explicit `ends_at` timestamp makes range/overlap queries trivially indexable (`WHERE starts_at < $end AND ends_at > $start`). But it introduces an update hazard — if a user reschedules the start time, the end time doesn't automatically move, creating a confusing UX or requiring extra logic to keep them in sync.

With `starts_at + duration_minutes`, moving the start time naturally moves the derived end. There's no risk of invalid ranges (end before start). It also fits the sports domain well — games have well-known durations (soccer ~120min, basketball ~150min), which opens the door for AI-suggested duration by sport type. The query trade-off (computed end in WHERE clauses) is negligible at our data scale.

---

## 2. `sport_type` as FK table vs. text column

**Decision:** FK to a `sport_types` reference table

**Trade-off:** A plain text column with a CHECK constraint is simpler — no JOINs, the Zod enum drives the form directly, and queries stay flat. But it creates a hard coupling between the application code and the allowed sport types. Adding a new sport type requires a code change AND a DB migration (to update the CHECK).

A reference table costs one extra JOIN on the dashboard query and a DB fetch for the form dropdown. In exchange, sport types become data (not code), making the planned "custom sport type request" feature trivial — just add a row. It also naturally supports metadata like display_order, which lets us order the dropdown by popularity without hardcoding. The JOIN overhead on a 17-row lookup table is effectively zero.

---

## 3. Event status: DB column vs. derived in UI

**Decision:** `status` column with `active` / `cancelled` only. Upcoming vs. past is derived from `starts_at + duration` vs. `now()`.

**Trade-off:** We considered storing `upcoming`, `past`, `cancelled` as explicit statuses, which would make queries simpler (`WHERE status = 'upcoming'`). But "upcoming" and "past" aren't user actions — they're temporal facts. An event doesn't "become past" through a status change; it happens when the clock passes `starts_at + duration`. Storing this as a status would require a cron job or trigger to keep it in sync, which is fragile.

Instead, `status` only tracks explicit user intent (active vs. cancelled). The UI/queries derive temporal state: `WHERE starts_at > now()` for upcoming, `WHERE starts_at + (duration_minutes * interval '1 minute') < now()` for past. This is always accurate with no sync needed.

---

## 4. Venue address: structured fields vs. single text

**Decision:** Structured fields — `address` (street), `city`, `state`, plus nullable `latitude`/`longitude`

**Trade-off:** A single `address` text field is the simplest UX — one input, done. But it makes filtering by city or state impossible without string parsing (unreliable), and venue deduplication ("is this the same Staples Center?") requires exact string matching.

Structured fields enable city/state filtering, dedup logic, and prepare for future Google Places autocomplete integration (which returns structured components). The lat/lng columns are nullable and unused in the initial build, but adding them now costs nothing and avoids a migration + geocoding backfill later when map integration ships.

---

## 5. Many-to-many events ↔ venues

**Decision:** Junction table `event_venues` with cascading deletes

**Trade-off:** The challenge specifies "Venues (Plural)" on events. The simplest approach would be a JSON array column (`venue_ids uuid[]`) on the events table. But this breaks referential integrity — a deleted venue leaves dangling IDs, and querying "all events at venue X" requires `ANY()` array operations that can't use standard indexes.

A proper junction table with foreign keys gives us cascading deletes, clean bidirectional queries (events → venues AND venues → events), and standard indexing. The extra table is minimal overhead and is the standard relational pattern for M:N relationships.

---

## 6. Server Actions over Route Handlers

**Decision:** Server Actions for all data mutations and fetches. The only Route Handler is `/auth/callback` (required by Supabase OAuth flow).

**Trade-off:** Route Handlers (API routes) are the traditional Next.js pattern and are familiar to most developers. But Fastbreak's team is explicitly moving toward Server Actions, and they told us so in the challenge brief. Server Actions colocate the mutation logic with the forms that trigger them, reduce boilerplate (no fetch calls, no URL routing), and integrate directly with React's `useTransition` for optimistic UI.

The `safeAction` wrapper gives us the same consistent `{ data, error }` contract that a REST API would, with the type safety benefit of being a direct function call rather than a serialized HTTP request.

---

## 7. Search/filter via URL params (server-side refetch)

**Decision:** Search and filter state lives in URL search params. Changing them triggers a Server Component re-render that refetches from the DB.

**Trade-off:** Client-side filtering (fetch all events once, filter in the browser) is snappier for small datasets. But the challenge explicitly requires "should refetch from the database." URL params also give us deep-linkable search results, browser back/forward navigation, and no stale client-side cache to manage. The DB does the filtering via indexed columns, which scales cleanly.

---

## 8. Grid + table toggle on the dashboard

**Decision:** Two view modes — responsive card grid (default) and compact data table. Toggle state stored in URL param (`?view=grid|list`).

**Trade-off:** The challenge asks for a "responsive grid/list layout." A grid-only layout that stacks on mobile satisfies the literal requirement. But a toggle between grid cards and a data-dense table view demonstrates more frontend skill and UX awareness. The table view shows more events per screen and supports the natural UX of clickable rows → event detail. Using a URL param (not local state) means the view preference survives page refreshes and is shareable.

---

## 9. Event detail + venue detail pages (beyond requirements)

**Decision:** Added `/events/[id]` (read-only event detail) and `/venues/[id]` (venue info + events at that venue), neither of which are in the original challenge spec.

**Trade-off:** The challenge only requires CRUD (create, edit, delete) and a dashboard list. But the natural UX of clicking an event card or a venue name to see details is table stakes for a real product. The venue detail page also demonstrates bidirectional relational queries (venue → events via the junction table). The incremental code cost is low since the data layer already supports these queries.

---

## 10. `pg_trgm` indexes for search

**Decision:** GIN indexes using `pg_trgm` on `events.name` and `venues.name` for `ilike '%term%'` search.

**Trade-off:** Standard btree indexes can't service `LIKE` with a leading wildcard. Without `pg_trgm`, every name search is a sequential scan — fine for dozens of rows, but degrades at scale. The alternative is Postgres full-text search (`tsvector`/`tsquery`), which is more powerful but changes the query API from simple `ilike` to `.textSearch()`. Since the challenge uses `ilike`, we stick with that pattern and add the trigram index to keep it performant.

---

## 11. Supabase CLI with hosted project

**Decision:** Use the Supabase CLI for schema management — `supabase init` + `supabase link` to a hosted project, migrations stored as `.sql` files in `supabase/migrations/`.

**Trade-off:** The quickest path is copy-pasting SQL into the Supabase dashboard. But migration files in git mean the schema is version-controlled, reproducible, and reviewable. Any team member can `supabase db push` to recreate the exact schema. The CLI workflow also enables a future CI/CD pipeline for automated migrations.
