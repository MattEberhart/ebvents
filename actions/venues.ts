'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { safeAction, UserError, type ActionResult } from '@/lib/utils'
import type { Venue, VenueWithEvents, VenueQueryParams, PaginatedResult } from '@/lib/types'
import type { VenueFormValues } from '@/lib/validations'
import { PAGE_SIZE } from '@/lib/constants'
import { mapEventWithVenues, paginationRange } from '@/lib/queries'

export async function getVenues(params?: VenueQueryParams): Promise<ActionResult<PaginatedResult<Venue>>> {
  return safeAction(async () => {
    const supabase = await createClient()
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? PAGE_SIZE
    const { from, to } = paginationRange(page, pageSize)

    const sortBy = params?.sortBy ?? 'name'
    const ascending = (params?.sortDir ?? 'asc') === 'asc'

    let query = supabase
      .from('venues')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending, nullsFirst: false })
      .range(from, to)

    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`)
    }

    if (params?.capacityMin) {
      query = query.gte('capacity', params.capacityMin)
    }

    if (params?.capacityMax) {
      query = query.lte('capacity', params.capacityMax)
    }

    const { data, error, count } = await query

    if (error) throw error

    const total = count ?? 0
    return {
      items: data ?? [],
      total,
      hasMore: from + (data?.length ?? 0) < total,
    }
  })
}

export async function searchVenues(search: string): Promise<ActionResult<Venue[]>> {
  return safeAction(async () => {
    const supabase = await createClient()

    let query = supabase
      .from('venues')
      .select('*')
      .order('name')
      .limit(20)

    if (search.trim()) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data ?? []
  })
}

export async function getVenue(id: string): Promise<ActionResult<VenueWithEvents>> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single()

    if (venueError) throw venueError

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
    const events = (eventVenues ?? []).map((ev: any) => mapEventWithVenues(ev.event))

    return {
      ...venue,
      events,
    } as VenueWithEvents
  })
}

export async function createVenue(values: VenueFormValues, cfImageId?: string): Promise<ActionResult<string>> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new UserError('Not authenticated')

    const { data, error } = await supabase
      .from('venues')
      .insert({
        name: values.name,
        address: values.address || null,
        city: values.city || null,
        state: values.state || null,
        capacity: values.capacity ? Number(values.capacity) : null,
        cf_image_id: cfImageId || null,
        created_by: user.id,
      })
      .select('id')
      .single()

    if (error) throw error
    revalidatePath('/venues')
    return data.id
  })
}

export async function updateVenue(id: string, values: VenueFormValues, cfImageId?: string): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new UserError('Not authenticated')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      name: values.name,
      address: values.address || null,
      city: values.city || null,
      state: values.state || null,
      capacity: values.capacity ? Number(values.capacity) : null,
    }

    if (cfImageId !== undefined) {
      updateData.cf_image_id = cfImageId || null
    }

    const { error } = await supabase
      .from('venues')
      .update(updateData)
      .eq('id', id)

    if (error) throw error
    revalidatePath('/venues')
    revalidatePath(`/venues/${id}`)
  })
}

export async function deleteVenue(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new UserError('Not authenticated')

    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', id)

    if (error) throw error
    revalidatePath('/venues')
  })
}

export async function requestVenueImageUploadUrl(): Promise<
  ActionResult<{ uploadURL: string; imageId: string }>
> {
  return safeAction(async () => {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN

    if (!accountId || !apiToken) {
      throw new Error('Cloudflare Images is not configured')
    }

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}` },
      },
    )

    const json = await res.json()
    if (!json.success) {
      throw new Error(json.errors?.[0]?.message ?? 'Failed to get upload URL')
    }

    return {
      uploadURL: json.result.uploadURL as string,
      imageId: json.result.id as string,
    }
  })
}

export async function confirmVenueImageUpload(
  venueId: string,
  imageId: string,
): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new UserError('Not authenticated')

    // Get old image ID for cleanup
    const { data: venue } = await supabase
      .from('venues')
      .select('cf_image_id')
      .eq('id', venueId)
      .single()

    const oldImageId = venue?.cf_image_id

    // Save new image ID
    const { error } = await supabase
      .from('venues')
      .update({ cf_image_id: imageId })
      .eq('id', venueId)

    if (error) throw error

    // Delete old CF image if it existed
    if (oldImageId) {
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
      const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN
      if (accountId && apiToken) {
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${oldImageId}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${apiToken}` },
          },
        ).catch(() => {})
      }
    }

    revalidatePath(`/venues/${venueId}`)
    revalidatePath('/venues')
  })
}
