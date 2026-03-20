import type { Venue } from '@/lib/types'
import { VenueCard } from './VenueCard'

export function VenueGrid({ venues }: { venues: Venue[] }) {
  if (venues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">No venues found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your search or create a new venue.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {venues.map((venue) => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
    </div>
  )
}
