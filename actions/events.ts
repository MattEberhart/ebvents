'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { safeAction, type ActionResult } from '@/lib/utils'
import type { EventWithVenues, SportType } from '@/lib/types'
import type { EventFormValues } from '@/lib/validations'

export async function createSportType(name: string): Promise<ActionResult<SportType>> {
  return safeAction(async () => {
    const supabase = await createClient()
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Sport name is required')

    // Check for duplicate (case-insensitive)
    const { data: existing } = await supabase
      .from('sport_types')
      .select('id')
      .ilike('name', trimmed)
      .maybeSingle()

    if (existing) throw new Error(`"${trimmed}" already exists`)

    // Get the max display_order to append at the end
    const { data: maxRow } = await supabase
      .from('sport_types')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxRow?.display_order ?? 98) + 1

    const { data, error } = await supabase
      .from('sport_types')
      .insert({ name: trimmed, display_order: nextOrder })
      .select('*')
      .single()

    if (error) throw error
    revalidatePath('/')
    return data as SportType
  })
}

export async function getSportTypes(): Promise<ActionResult<SportType[]>> {
  return safeAction(async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('sport_types')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (error) throw error
    return data
  })
}

export async function getEvents(params?: {
  search?: string
  sport?: string
}): Promise<ActionResult<EventWithVenues[]>> {
  return safeAction(async () => {
    const supabase = await createClient()

    let query = supabase
      .from('events')
      .select(`
        *,
        sport_type:sport_types(*),
        event_venues(
          venue:venues(*)
        )
      `)
      .eq('status', 'active')
      .order('starts_at', { ascending: false })

    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`)
    }

    if (params?.sport) {
      query = query.eq('sport_type_id', params.sport)
    }

    const { data, error } = await query

    if (error) throw error

    return (data ?? []).map((event) => ({
      ...event,
      sport_type: event.sport_type,
      venues: event.event_venues?.map((ev: { venue: unknown }) => ev.venue) ?? [],
      event_venues: undefined,
    })) as EventWithVenues[]
  })
}

export async function getEvent(id: string): Promise<ActionResult<EventWithVenues>> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        sport_type:sport_types(*),
        event_venues(
          venue:venues(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      ...data,
      sport_type: data.sport_type,
      venues: data.event_venues?.map((ev: { venue: unknown }) => ev.venue) ?? [],
      event_venues: undefined,
    } as EventWithVenues
  })
}

export async function createEvent(values: EventFormValues): Promise<ActionResult<string>> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const startsAt = new Date(`${values.start_date}T${values.start_time}`).toISOString()

    // Insert the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        user_id: user.id,
        sport_type_id: values.sport_type_id,
        name: values.name,
        starts_at: startsAt,
        duration_minutes: values.duration_minutes,
        description: values.description || null,
      })
      .select('id')
      .single()

    if (eventError) throw eventError

    // Upsert venues and create junction rows
    for (const venue of values.venues) {
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
            created_by: user.id,
          })
          .select('id')
          .single()

        if (venueError) throw venueError
        venueId = newVenue.id
      }

      const { error: junctionError } = await supabase
        .from('event_venues')
        .insert({ event_id: event.id, venue_id: venueId })

      if (junctionError) throw junctionError
    }

    revalidatePath('/')
    return event.id
  })
}

export async function updateEvent(id: string, values: EventFormValues): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const startsAt = new Date(`${values.start_date}T${values.start_time}`).toISOString()

    // Update the event row
    const { error: eventError } = await supabase
      .from('events')
      .update({
        sport_type_id: values.sport_type_id,
        name: values.name,
        starts_at: startsAt,
        duration_minutes: values.duration_minutes,
        description: values.description || null,
      })
      .eq('id', id)

    if (eventError) throw eventError

    // Delete old junction rows
    const { error: deleteError } = await supabase
      .from('event_venues')
      .delete()
      .eq('event_id', id)

    if (deleteError) throw deleteError

    // Re-create venues + junction rows
    for (const venue of values.venues) {
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
            created_by: user.id,
          })
          .select('id')
          .single()

        if (venueError) throw venueError
        venueId = newVenue.id
      }

      const { error: junctionError } = await supabase
        .from('event_venues')
        .insert({ event_id: id, venue_id: venueId })

      if (junctionError) throw junctionError
    }

    revalidatePath('/')
    revalidatePath(`/events/${id}`)
  })
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error
    revalidatePath('/')
  })
}

export async function cancelEvent(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/')
    revalidatePath(`/events/${id}`)
  })
}
