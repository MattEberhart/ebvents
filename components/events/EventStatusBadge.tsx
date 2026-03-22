import { getEventStatus } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface EventStatusBadgeProps {
  startsAt: string
  durationMinutes: number
  status: string
}

export function EventStatusBadge({ startsAt, durationMinutes, status }: EventStatusBadgeProps) {
  const eventStatus = getEventStatus(startsAt, durationMinutes, status)

  switch (eventStatus) {
    case 'live':
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-green-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Live
        </span>
      )
    case 'upcoming':
      return <Badge variant="outline" className="text-xs">Upcoming</Badge>
    case 'past':
      return <Badge variant="secondary" className="text-xs">Past</Badge>
    case 'cancelled':
      return <Badge variant="destructive" className="text-xs">Cancelled</Badge>
  }
}
