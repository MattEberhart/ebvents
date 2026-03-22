import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEvent } from '@/actions/events'
import { cn, sportColor, formatEventDate, formatEventTimeRange } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DeleteEventButton } from '@/components/events/DeleteEventButton'
import { CancelEventButton } from '@/components/events/CancelEventButton'
import { ReactivateEventButton } from '@/components/events/ReactivateEventButton'
import { EventStatusBadge } from '@/components/events/EventStatusBadge'
import { MapPinIcon, ClockIcon, CalendarIcon, ArrowLeftIcon, UsersIcon } from 'lucide-react'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: event, error } = await getEvent(id)

  if (error || !event) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" render={<Link href="/" />}>
        <ArrowLeftIcon className="mr-1" />
        Back to events
      </Button>

      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={cn('inline-block rounded-md px-2 py-0.5 text-xs font-medium', sportColor(event.sport_type.name))}>
            {event.sport_type.name}
          </span>
          <EventStatusBadge startsAt={event.starts_at} durationMinutes={event.duration_minutes} status={event.status} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="size-4" />
            {formatEventDate(event.starts_at)}
          </div>
          <div className="flex items-center gap-1.5">
            <ClockIcon className="size-4" />
            {formatEventTimeRange(event.starts_at, event.duration_minutes)}
          </div>
        </div>

        {event.description && (
          <>
            <Separator className="my-4" />
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </>
        )}

        {event.venues.length > 0 && (
          <>
            <Separator className="my-4" />
            <h2 className="text-sm font-medium mb-3">Venues</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {event.venues.map((venue) => (
                <Card key={venue.id} size="sm">
                  <CardHeader>
                    <CardTitle>
                      <Link
                        href={`/venues/${venue.id}?from=/events/${event.id}`}
                        className="hover:underline"
                      >
                        {venue.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm text-muted-foreground">
                    {(venue.address || venue.city || venue.state) && (
                      <div className="flex items-start gap-1.5">
                        <MapPinIcon className="size-3.5 mt-0.5 shrink-0" />
                        <span>
                          {[venue.address, venue.city, venue.state, venue.zip_code]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {venue.capacity && (
                      <div className="flex items-center gap-1.5">
                        <UsersIcon className="size-3.5" />
                        <span>Capacity: {venue.capacity.toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <Separator />
      <div className="flex items-center gap-2">
        <Button size="sm" render={<Link href={`/events/${event.id}/edit`} />}>
          Edit event
        </Button>
        {event.status === 'active' && (
          <CancelEventButton eventId={event.id} />
        )}
        {event.status === 'cancelled' && (
          <ReactivateEventButton eventId={event.id} />
        )}
        <DeleteEventButton
          eventId={event.id}
          eventName={event.name}
          redirectTo="/"
        />
      </div>
    </div>
  )
}
