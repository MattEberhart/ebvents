import type { Profile } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

const CF_ACCOUNT_HASH = process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH

export function getCfImageUrl(imageId: string, variant = 'public'): string {
  return `https://imagedelivery.net/${CF_ACCOUNT_HASH}/${imageId}/${variant}`
}

export async function deleteCfImage(imageId: string): Promise<void> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN
  if (!accountId || !apiToken) return

  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${apiToken}` },
    },
  ).catch(() => {
    // Non-critical — image will remain in CF but won't be referenced
  })
}

export function getAvatarUrl(
  profile: Profile | null,
  user: User | null,
): string | null {
  if (profile?.cf_image_id) {
    return getCfImageUrl(profile.cf_image_id, 'avatar')
  }
  return user?.user_metadata?.avatar_url ?? null
}
