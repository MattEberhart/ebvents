import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getVenue } from '@/actions/venues'
import { createClient } from '@/lib/supabase/server'
import { cn, sportColor, formatEventDate, formatEventTime, formatDuration, isEventPast } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeftIcon, MapPinIcon, UsersIcon, ClockIcon } from 'lucide-react'

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: venue, error } = await getVenue(id)

  if (error || !venue) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const upcomingEvents = venue.events
    .filter((e) => !isEventPast(e.starts_at, e.duration_minutes) && e.status === 'active')
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())

  const pastEvents = venue.events
    .filter((e) => isEventPast(e.starts_at, e.duration_minutes) || e.status === 'cancelled')
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" render={<Link href="/" />}>
        <ArrowLeftIcon className="mr-1" />
        Back to events
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{venue.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {(venue.address || venue.city || venue.state) && (
            <div className="flex items-start gap-1.5">
              <MapPinIcon className="size-4 mt-0.5 shrink-0" />
              <span>
                {[venue.address, venue.city, venue.state]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
          {venue.capacity && (
            <div className="flex items-center gap-1.5">
              <UsersIcon className="size-4" />
              <span>Capacity: {venue.capacity.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {upcomingEvents.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-3">Upcoming Events</h2>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block">
                  <Card size="sm" className="hover:bg-muted/50 transition-colors">
                    <CardContent className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={cn('inline-block rounded-md px-2 py-0.5 text-xs font-medium', sportColor(event.sport_type.name))}>
                          {event.sport_type.name}
                        </span>
                        <span className="font-medium">{event.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <ClockIcon className="size-3.5" />
                        {formatEventDate(event.starts_at)} at {formatEventTime(event.starts_at)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {pastEvents.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-3">Past Events</h2>
            <div className="space-y-2">
              {pastEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block">
                  <Card size="sm" className="opacity-60 hover:opacity-80 transition-opacity">
                    <CardContent className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={cn('inline-block rounded-md px-2 py-0.5 text-xs font-medium', sportColor(event.sport_type.name))}>
                          {event.sport_type.name}
                        </span>
                        <span className="font-medium">{event.name}</span>
                        {event.status === 'cancelled' && (
                          <Badge variant="destructive" className="text-xs">Cancelled</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <ClockIcon className="size-3.5" />
                        {formatEventDate(event.starts_at)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {venue.events.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No events at this venue yet.</p>
        </div>
      )}
    </div>
  )
}
