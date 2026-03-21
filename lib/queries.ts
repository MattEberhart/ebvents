import type { SupabaseClient } from '@supabase/supabase-js'
import type { EventWithVenues } from '@/lib/types'
import { PAGE_SIZE } from '@/lib/constants'

// Shared PostgREST select string for events with sport_type + venues join
export const EVENT_WITH_VENUES_SELECT = `
  *,
  sport_type:sport_types(*),
  event_venues(venue:venues(*))
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapEventWithVenues(raw: any): EventWithVenues {
  return {
    ...raw,
    sport_type: raw.sport_type,
    venues: raw.event_venues?.map((ev: { venue: unknown }) => ev.venue) ?? [],
    event_venues: undefined,
  } as EventWithVenues
}

export function paginationRange(page: number, pageSize: number = PAGE_SIZE) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return { from, to }
}

interface VenueInput {
  id?: string
  name: string
  address?: string
  city?: string
  state?: string
  capacity?: number | string
}

export async function upsertVenuesForEvent(
  supabase: SupabaseClient,
  eventId: string,
  venues: VenueInput[],
  userId: string,
): Promise<void> {
  for (const venue of venues) {
    let venueId = venue.id

    if (!venueId) {
      const { data: newVenue, error: venueError } = await supabase
        .from('venues')
        .insert({
          name: venue.name,
          address: venue.address || null,
          city: venue.city || null,
          state: venue.state || null,
          capacity: venue.capacity ? Number(venue.capacity) : null,
          created_by: userId,
        })
        .select('id')
        .single()

      if (venueError) throw venueError
      venueId = newVenue.id
    }

    const { error: junctionError } = await supabase
      .from('event_venues')
      .insert({ event_id: eventId, venue_id: venueId })

    if (junctionError) throw junctionError
  }
}
