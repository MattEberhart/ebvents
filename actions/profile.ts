'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { safeAction, UserError, type ActionResult } from '@/lib/utils'
import type { Profile } from '@/lib/types'

export async function getProfile(): Promise<ActionResult<Profile>> {
  return safeAction(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new UserError('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data as Profile
  })
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new UserError('Not authenticated')

    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string | null

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName || null,
      })
      .eq('id', user.id)

    if (error) throw error
    revalidatePath('/')
  })
}

export async function requestAvatarUploadUrl(): Promise<
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

export async function confirmAvatarUpload(
  imageId: string,
): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new UserError('Not authenticated')

    // Get old image ID for cleanup
    const { data: profile } = await supabase
      .from('profiles')
      .select('cf_image_id')
      .eq('id', user.id)
      .single()

    const oldImageId = profile?.cf_image_id

    // Save new image ID
    const { error } = await supabase
      .from('profiles')
      .update({ cf_image_id: imageId })
      .eq('id', user.id)

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
        ).catch(() => {
          // Non-critical — old image will remain in CF but won't be referenced
        })
      }
    }

    revalidatePath('/')
  })
}
