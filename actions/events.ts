'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { safeAction, type ActionResult } from '@/lib/utils'
import type { EventWithVenues, EventQueryParams, PaginatedResult } from '@/lib/types'
import type { EventFormValues } from '@/lib/validations'
import { PAGE_SIZE } from '@/lib/constants'
import { EVENT_WITH_VENUES_SELECT, mapEventWithVenues, paginationRange, upsertVenuesForEvent } from '@/lib/queries'

export async function getEvents(params?: EventQueryParams): Promise<ActionResult<PaginatedResult<EventWithVenues>>> {
  return safeAction(async () => {
    const supabase = await createClient()
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? PAGE_SIZE
    const { from, to } = paginationRange(page, pageSize)

    const sortBy = params?.sortBy ?? 'starts_at'
    const ascending = (params?.sortDir ?? 'desc') === 'asc'
    const status = params?.status ?? 'all'

    let query = supabase
      .from('events')
      .select(EVENT_WITH_VENUES_SELECT, { count: 'exact' })
      .order(sortBy, { ascending })
      .range(from, to)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`)
    }

    if (params?.sport) {
      query = query.eq('sport_type_id', params.sport)
    }

    const { data, error, count } = await query

    if (error) throw error

    const total = count ?? 0
    const items = (data ?? []).map(mapEventWithVenues)

    return {
      items,
      total,
      hasMore: from + items.length < total,
    }
  })
}

export async function getEvent(id: string): Promise<ActionResult<EventWithVenues>> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('events')
      .select(EVENT_WITH_VENUES_SELECT)
      .eq('id', id)
      .single()

    if (error) throw error
    return mapEventWithVenues(data)
  })
}

export async function createEvent(values: EventFormValues): Promise<ActionResult<string>> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const startsAt = new Date(`${values.start_date}T${values.start_time}`).toISOString()

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

    await upsertVenuesForEvent(supabase, event.id, values.venues, user.id)

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

    await upsertVenuesForEvent(supabase, id, values.venues, user.id)

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
