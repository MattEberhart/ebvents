import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/actions/auth'
import { getProfile } from '@/actions/profile'
import { getAvatarUrl } from '@/lib/cloudflare'
import { Button } from '@/components/ui/button'
import AvatarUpload from '@/components/AvatarUpload'

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
            <Button variant="ghost" size="sm" render={<Link href="/venues" />}>
              Venues
            </Button>
            <Button size="sm" render={<Link href="/events/new" />}>
              New Event
            </Button>
            <div className="flex items-center gap-2">
              <AvatarUpload avatarUrl={avatarUrl} firstName={profile?.first_name ?? null} />
              {profile?.first_name && (
                <span className="hidden text-sm sm:inline">
                  Hi, {profile.first_name}
                </span>
              )}
            </div>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>
    </div>
  )
}
