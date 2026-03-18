import type { EventWithVenues } from '@/lib/types'
import { EventCard } from './EventCard'

export function EventGrid({
  events,
  userId,
}: {
  events: EventWithVenues[]
  userId: string
}) {
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isOwner={event.user_id === userId}
        />
      ))}
    </div>
  )
}
