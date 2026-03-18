# Ebvents — Sports Event Dashboard

Full-stack Sports Event Management app built for a developer interview challenge.

## Stack
- Next.js 15 App Router, TypeScript strict
- Supabase (Postgres + Auth: email/password + Google OAuth)
- Tailwind CSS + shadcn/ui (v4, base-nova style)
- react-hook-form + zod on every form
- sonner for toasts
- Vercel for deployment

## Spec files — read before each phase

- Database schema, RLS, migrations → @docs/database.md
- Types, safeAction helper, all Server Actions → @docs/actions.md
- Coding rules, patterns, what not to do → @docs/conventions.md
- Architecture decisions and trade-offs → @docs/decisions.md
- Future feature ideas → @docs/todos/

## Folder structure

```
app/
  (auth)/login/page.tsx
  (auth)/signup/page.tsx
  (auth)/error.tsx
  (dashboard)/layout.tsx
  (dashboard)/page.tsx
  (dashboard)/loading.tsx
  (dashboard)/error.tsx
  (dashboard)/events/new/page.tsx
  (dashboard)/events/[id]/page.tsx
  (dashboard)/events/[id]/edit/page.tsx
  (dashboard)/venues/[id]/page.tsx
  auth/callback/route.ts
actions/
  auth.ts
  events.ts
  profile.ts
  venues.ts
lib/
  cloudflare.ts
  supabase/server.ts
  supabase/middleware.ts
  types.ts
  utils.ts
  validations.ts
components/
  AvatarUpload.tsx
  events/EventCard.tsx
  events/EventGrid.tsx
  events/EventTable.tsx
  events/EventForm.tsx
  events/EventSearch.tsx
  events/ViewToggle.tsx
  events/DeleteEventButton.tsx
  events/CancelEventButton.tsx
  venues/VenueFieldArray.tsx
middleware.ts
supabase/
  migrations/
    00001_initial_schema.sql
```

## Implementation order

1. Scaffold + install packages (see @docs/conventions.md)
2. Run DB migrations via Supabase CLI or dashboard (see @docs/database.md)
3. Build lib/ helpers and Server Actions (see @docs/actions.md)
4. Auth pages, dashboard layout, event CRUD pages and components
5. Event detail + venue detail pages (beyond requirements)
6. Deploy to Vercel
