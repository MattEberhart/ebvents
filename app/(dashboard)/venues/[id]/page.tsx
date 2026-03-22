import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getVenue } from '@/actions/venues'
import { getCfImageUrl } from '@/lib/cloudflare'
import { cn, sportColor, formatEventDate, formatEventTimeRange, isEventPast } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EventStatusBadge } from '@/components/events/EventStatusBadge'
import { DeleteVenueButton } from '@/components/venues/DeleteVenueButton'
import { ArrowLeftIcon, MapPinIcon, UsersIcon, ClockIcon } from 'lucide-react'

export default async function VenueDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const from = sp.from
  const { data: venue, error } = await getVenue(id)

  if (error || !venue) notFound()

  const imageUrl = venue.cf_image_id ? getCfImageUrl(venue.cf_image_id) : null

  const upcomingEvents = venue.events
    .filter((e) => !isEventPast(e.starts_at, e.duration_minutes))
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())

  const pastEvents = venue.events
    .filter((e) => isEventPast(e.starts_at, e.duration_minutes))
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())

  // Determine back link based on navigation context
  let backHref = '/venues'
  let backLabel = 'Back to venues'
  if (from?.startsWith('/events/')) {
    backHref = from
    backLabel = 'Back to event'
  } else if (from === '/') {
    backHref = '/'
    backLabel = 'Back to events'
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" render={<Link href={backHref} />}>
        <ArrowLeftIcon className="mr-1" />
        {backLabel}
      </Button>

      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{venue.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {(venue.address || venue.city || venue.state || venue.zip_code) && (
            <div className="flex items-start gap-1.5">
              <MapPinIcon className="size-4 mt-0.5 shrink-0" />
              <span>
                {[venue.address, venue.city, venue.state, venue.zip_code]
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

      <div className="flex items-center gap-2">
        <Button size="sm" render={<Link href={`/venues/${venue.id}/edit`} />}>
          Edit venue
        </Button>
        <DeleteVenueButton venueId={venue.id} venueName={venue.name} redirectTo="/venues" />
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
                        <EventStatusBadge startsAt={event.starts_at} durationMinutes={event.duration_minutes} status={event.status} />
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <ClockIcon className="size-3.5" />
                        {formatEventDate(event.starts_at)} &middot; {formatEventTimeRange(event.starts_at, event.duration_minutes)}
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
                  <Card size="sm" className="hover:bg-muted/50 transition-colors">
                    <CardContent className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={cn('inline-block rounded-md px-2 py-0.5 text-xs font-medium', sportColor(event.sport_type.name))}>
                          {event.sport_type.name}
                        </span>
                        <span className="font-medium">{event.name}</span>
                        <EventStatusBadge startsAt={event.starts_at} durationMinutes={event.duration_minutes} status={event.status} />
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
