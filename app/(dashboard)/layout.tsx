import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/actions/profile'
import { getAvatarUrl } from '@/lib/cloudflare'
import { NavLinks } from '@/components/NavLinks'
import { AccountSheet } from '@/components/AccountSheet'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await getProfile()
  const avatarUrl = getAvatarUrl(profile, user)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            ebvents
          </Link>
          <div className="flex items-center gap-3">
            <NavLinks />
            <AccountSheet
              avatarUrl={avatarUrl}
              firstName={profile?.first_name ?? null}
              lastName={profile?.last_name ?? null}
              email={user?.email ?? ''}
            />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>
    </div>
  )
}
