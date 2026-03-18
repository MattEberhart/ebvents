# Actions + Types

## Types (`lib/types.ts`)

```typescript
export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  cf_image_id: string | null
  created_at: string
}

export interface SportType {
  id: string
  name: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Venue {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  capacity: number | null
  latitude: number | null
  longitude: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  user_id: string
  sport_type_id: string
  name: string
  starts_at: string          // timestamptz
  duration_minutes: number   // end time derived: starts_at + duration
  description: string | null
  status: 'active' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface EventWithVenues extends Event {
  sport_type: SportType      // joined from sport_types table
  venues: Venue[]            // joined via event_venues
}

export interface VenueWithEvents extends Venue {
  events: EventWithVenues[]  // reverse lookup via event_venues
}
```

## safeAction helper (`lib/utils.ts`)

Every Server Action must use this. It guarantees a consistent `{ data, error }` return — never throws to the client.

```typescript
export type ActionResult<T = void> =
  | { data: T; error: null }
  | { data: null; error: string }

export async function safeAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { data: await fn(), error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    console.error('[safeAction]', message)
    return { data: null, error: message }
  }
}
```

## Zod schemas (`lib/validations.ts`)

```typescript
export const venueSchema = z.object({
  id: z.string().optional(),        // set when reusing an existing venue
  name: z.string().min(1, 'Venue name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  capacity: z.coerce.number().positive().optional().or(z.literal('')),
})

export const eventSchema = z.object({
  name: z.string().min(1).max(100),
  sport_type_id: z.string().min(1, 'Sport type is required'),
  start_date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Time is required'),
  duration_minutes: z.coerce.number().min(1).max(1440),
  description: z.string().max(500).optional(),
  venues: z.array(venueSchema).min(1, 'At least one venue is required'),
})
```

The `starts_at` timestamptz is constructed in the action from `start_date` + `start_time`:
```typescript
const startsAt = new Date(`${values.start_date}T${values.start_time}`).toISOString()
```

Capacity `""` maps to `null` in the action.

## Server Action signatures

All actions are in `actions/` and wrapped with `safeAction`. Implement each fully.

**`actions/auth.ts`**
- `signUp(formData)` — supabase.auth.signUp with email, password, first_name + last_name metadata
- `signIn(formData)` — supabase.auth.signInWithPassword
- `signInWithGoogle()` — supabase.auth.signInWithOAuth, returns the redirect URL as data
- `signOut()` — signs out then redirect('/login')

**`actions/events.ts`**
- `getSportTypes()` — fetch all active sport types ordered by display_order (for form dropdown)
- `getEvents({ search?, sport? })` — query with optional ilike on name, eq on sport_type_id; join sport_types + event_venues > venues; flatten into `sport_type` and `venues[]`
- `getEvent(id)` — single event with sport_type and venues, same join/flatten
- `createEvent(values: EventFormValues)` — insert event, upsert venues (reuse by id, create new), insert event_venues; revalidatePath('/')
- `updateEvent(id, values)` — update event row, delete old event_venues, re-upsert venues; revalidatePath
- `deleteEvent(id)` — delete where id + user_id match; revalidatePath('/')
- `cancelEvent(id)` — set status to 'cancelled'; revalidatePath

**`actions/profile.ts`**
- `getProfile()` — fetch current user's profile row
- `updateProfile(formData)` — update first_name, last_name; revalidatePath
- `requestAvatarUploadUrl()` — calls Cloudflare Direct Creator Upload API, returns `{ uploadURL, imageId }`
- `confirmAvatarUpload(imageId)` — saves cf_image_id to profile, deletes old CF image if any

**`actions/venues.ts`**
- `getVenues(search?)` — ilike search on name, limit 20
- `getVenue(id)` — venue with all events (reverse lookup via event_venues)

## Supabase client (`lib/supabase/server.ts`)

Use `createServerClient` from `@supabase/ssr` with `cookies()` from `next/headers`. This is the only Supabase client used in the app — imported by all Server Actions and Server Components.

## Middleware (`lib/supabase/middleware.ts` + `middleware.ts`)

- Refreshes the Supabase session on every request
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login` and `/signup` to `/`

## OAuth callback (`app/auth/callback/route.ts`)

Route Handler (the one exception to the actions-only rule). Exchanges the code param for a session via `supabase.auth.exchangeCodeForSession(code)`, then redirects to `/`.
