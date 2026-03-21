'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { safeAction, type ActionResult } from '@/lib/utils'
import type { SportType } from '@/lib/types'

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
