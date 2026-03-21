'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Venue } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { DeleteVenueButton } from './DeleteVenueButton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function VenueTable({ venues }: { venues: Venue[] }) {
  const router = useRouter()

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>City</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Zip</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead className="w-[100px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {venues.map((venue) => (
          <TableRow
            key={venue.id}
            className="cursor-pointer"
            onClick={() => router.push(`/venues/${venue.id}`)}
          >
            <TableCell className="font-medium">{venue.name}</TableCell>
            <TableCell>{venue.city ?? '—'}</TableCell>
            <TableCell>{venue.state ?? '—'}</TableCell>
            <TableCell>{venue.zip_code ?? '—'}</TableCell>
            <TableCell>
              {venue.capacity ? venue.capacity.toLocaleString() : '—'}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="xs" render={<Link href={`/venues/${venue.id}/edit`} />}>
                  Edit
                </Button>
                <DeleteVenueButton venueId={venue.id} venueName={venue.name} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
