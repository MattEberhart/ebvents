import type { Profile } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

const CF_ACCOUNT_HASH = process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH

export function getCfImageUrl(imageId: string, variant = 'public'): string {
  return `https://imagedelivery.net/${CF_ACCOUNT_HASH}/${imageId}/${variant}`
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
