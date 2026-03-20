'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { EventWithVenues } from '@/lib/types'
import { cn, sportColor, formatEventDate, formatEventTime, formatDuration, isEventPast, isEventLive } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteEventButton } from './DeleteEventButton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function EventTable({
  events,
}: {
  events: EventWithVenues[]
}) {
  const router = useRouter()

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">No events found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your search or create a new event.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Sport</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Venue</TableHead>
          <TableHead className="w-[100px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => {
          const past = isEventPast(event.starts_at, event.duration_minutes)
          const live = isEventLive(event.starts_at, event.duration_minutes)
          const cancelled = event.status === 'cancelled'
          return (
            <TableRow
              key={event.id}
              className={cn(
                'cursor-pointer',
                past && 'opacity-60',
                cancelled && 'opacity-50'
              )}
              onClick={() => router.push(`/events/${event.id}`)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {event.name}
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
              </TableCell>
              <TableCell>
                <span className={cn('inline-block rounded-md px-2 py-0.5 text-xs font-medium', sportColor(event.sport_type.name))}>
                  {event.sport_type.name}
                </span>
              </TableCell>
              <TableCell>{formatEventDate(event.starts_at)}</TableCell>
              <TableCell>{formatEventTime(event.starts_at)}</TableCell>
              <TableCell>{formatDuration(event.duration_minutes)}</TableCell>
              <TableCell>
                {event.venues.map((v, i) => (
                  <span key={v.id}>
                    {i > 0 && ', '}
                    <Link
                      href={`/venues/${v.id}`}
                      className="hover:underline text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {v.name}
                    </Link>
                  </span>
                ))}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="xs" render={<Link href={`/events/${event.id}/edit`} />}>
                    Edit
                  </Button>
                  <DeleteEventButton eventId={event.id} eventName={event.name} size="xs" />
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
