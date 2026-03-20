import Link from 'next/link'
import type { EventWithVenues } from '@/lib/types'
import { cn, sportColor, formatEventDate, formatEventTime, formatDuration, isEventPast, isEventLive } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DeleteEventButton } from './DeleteEventButton'
import { MapPinIcon, ClockIcon } from 'lucide-react'

export function EventCard({
  event,
}: {
  event: EventWithVenues
}) {
  const past = isEventPast(event.starts_at, event.duration_minutes)
  const live = isEventLive(event.starts_at, event.duration_minutes)
  const cancelled = event.status === 'cancelled'

  return (
    <Card className={cn(past && 'opacity-60', cancelled && 'opacity-50')}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <span className={cn('inline-block rounded-md px-2 py-0.5 text-xs font-medium', sportColor(event.sport_type.name))}>
            {event.sport_type.name}
          </span>
          <div className="flex items-center gap-1.5">
            {live && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Live
              </span>
            )}
            {cancelled && (
              <Badge variant="destructive" className="text-xs">Cancelled</Badge>
            )}
          </div>
        </div>
        <CardTitle className="line-clamp-1">
          <Link href={`/events/${event.id}`} className="hover:underline">
            {event.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ClockIcon className="size-3.5" />
          <span>{formatEventDate(event.starts_at)} at {formatEventTime(event.starts_at)}</span>
          <span className="text-muted-foreground/50">·</span>
          <span>{formatDuration(event.duration_minutes)}</span>
        </div>
        {event.venues.length > 0 && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="size-3.5 mt-0.5 shrink-0" />
            <div>
              {event.venues.map((v, i) => (
                <span key={v.id}>
                  {i > 0 && ', '}
                  <Link
                    href={`/venues/${v.id}`}
                    className="hover:underline hover:text-foreground"
                  >
                    {v.name}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" render={<Link href={`/events/${event.id}/edit`} />}>
          Edit
        </Button>
        <DeleteEventButton eventId={event.id} eventName={event.name} />
      </CardFooter>
    </Card>
  )
}

