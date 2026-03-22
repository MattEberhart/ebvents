'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { EventWithVenues } from '@/lib/types'
import { cn, sportColor, formatEventDate, formatEventTimeRange } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DeleteEventButton } from './DeleteEventButton'
import { EventStatusBadge } from './EventStatusBadge'
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
          <TableHead>Status</TableHead>
          <TableHead>Sport</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Venue</TableHead>
          <TableHead className="w-[100px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => {
          return (
            <TableRow
              key={event.id}
              className="cursor-pointer"
              onClick={() => router.push(`/events/${event.id}`)}
            >
              <TableCell className="font-medium">
                {event.name}
              </TableCell>
              <TableCell>
                <EventStatusBadge
                  startsAt={event.starts_at}
                  durationMinutes={event.duration_minutes}
                  status={event.status}
                />
              </TableCell>
              <TableCell>
                <span className={cn('inline-block rounded-md px-2 py-0.5 text-xs font-medium', sportColor(event.sport_type.name))}>
                  {event.sport_type.name}
                </span>
              </TableCell>
              <TableCell>{formatEventDate(event.starts_at)}</TableCell>
              <TableCell>{formatEventTimeRange(event.starts_at, event.duration_minutes)}</TableCell>
              <TableCell>
                {event.venues.map((v, i) => (
                  <span key={v.id}>
                    {i > 0 && ', '}
                    <Link
                      href={`/venues/${v.id}?from=/events/${event.id}`}
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
