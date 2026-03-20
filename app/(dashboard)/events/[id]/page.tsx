import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEvent } from '@/actions/events'
import { cn, sportColor, formatEventDate, formatEventTime, formatDuration, isEventPast, isEventLive } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DeleteEventButton } from '@/components/events/DeleteEventButton'
import { CancelEventButton } from '@/components/events/CancelEventButton'
import { MapPinIcon, ClockIcon, CalendarIcon, ArrowLeftIcon, UsersIcon } from 'lucide-react'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: event, error } = await getEvent(id)

  if (error || !event) notFound()

  const past = isEventPast(event.starts_at, event.duration_minutes)
  const live = isEventLive(event.starts_at, event.duration_minutes)
  const cancelled = event.status === 'cancelled'

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" render={<Link href="/" />}>
        <ArrowLeftIcon className="mr-1" />
        Back to events
      </Button>

      <div className={cn(cancelled && 'opacity-60')}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={cn('inline-block rounded-md px-2 py-0.5 text-xs font-medium', sportColor(event.sport_type.name))}>
            {event.sport_type.name}
          </span>
          {live && (
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Live now
            </span>
          )}
          {past && !cancelled && (
            <Badge variant="secondary">Past</Badge>
          )}
          {cancelled && (
            <Badge variant="destructive">Cancelled</Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="size-4" />
            {formatEventDate(event.starts_at)}
          </div>
          <div className="flex items-center gap-1.5">
            <ClockIcon className="size-4" />
            {formatEventTime(event.starts_at)} · {formatDuration(event.duration_minutes)}
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
                        href={`/venues/${venue.id}`}
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
                          {[venue.address, venue.city, venue.state]
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
        <DeleteEventButton
          eventId={event.id}
          eventName={event.name}
          redirectTo="/"
        />
      </div>
    </div>
  )
}
