'use server'

import { createClient } from '@/lib/supabase/server'
import { safeAction, type ActionResult } from '@/lib/utils'
import type { Venue, VenueWithEvents, EventWithVenues } from '@/lib/types'

export async function getVenues(search?: string): Promise<ActionResult<Venue[]>> {
  return safeAction(async () => {
    const supabase = await createClient()

    let query = supabase
      .from('venues')
      .select('*')
      .order('name')
      .limit(20)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  })
}

export async function getVenue(id: string): Promise<ActionResult<VenueWithEvents>> {
  return safeAction(async () => {
    const supabase = await createClient()

    // Fetch venue
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single()

    if (venueError) throw venueError

    // Fetch events at this venue
    const { data: eventVenues, error: evError } = await supabase
      .from('event_venues')
      .select(`
        event:events(
          *,
          sport_type:sport_types(*),
          event_venues(
            venue:venues(*)
          )
        )
      `)
      .eq('venue_id', id)

    if (evError) throw evError

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events = (eventVenues ?? []).map((ev: any) => {
      const event = ev.event
      return {
        ...event,
        sport_type: event.sport_type,
        venues: event.event_venues?.map((v: any) => v.venue) ?? [],
      }
    }) as unknown as EventWithVenues[]

    return {
      ...venue,
      events,
    } as VenueWithEvents
  })
}
