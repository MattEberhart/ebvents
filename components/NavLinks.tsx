'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NavLinks() {
  const pathname = usePathname()

  const isEvents = pathname === '/' || pathname.startsWith('/events')
  const isVenues = pathname.startsWith('/venues')

  return (
    <nav className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(isEvents && 'bg-accent text-accent-foreground')}
        render={<Link href="/" />}
      >
        Events
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(isVenues && 'bg-accent text-accent-foreground')}
        render={<Link href="/venues" />}
      >
        Venues
      </Button>
    </nav>
  )
}
