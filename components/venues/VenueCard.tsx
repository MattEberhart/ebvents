import Link from 'next/link'
import type { Venue } from '@/lib/types'
import { getCfImageUrl } from '@/lib/cloudflare'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DeleteVenueButton } from './DeleteVenueButton'
import { MapPinIcon, UsersIcon, ImageIcon } from 'lucide-react'

export function VenueCard({ venue }: { venue: Venue }) {
  const imageUrl = venue.cf_image_id ? getCfImageUrl(venue.cf_image_id) : null

  return (
    <Card>
      {imageUrl ? (
        <div className="h-32 overflow-hidden rounded-t-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-t-lg bg-muted">
          <ImageIcon className="size-8 text-muted-foreground/40" />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-1">
          <Link href={`/venues/${venue.id}`} className="hover:underline">
            {venue.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {(venue.address || venue.city || venue.state) && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="size-3.5 mt-0.5 shrink-0" />
            <span>
              {[venue.address, venue.city, venue.state].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        {venue.capacity && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <UsersIcon className="size-3.5" />
            <span>Capacity: {venue.capacity.toLocaleString()}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" render={<Link href={`/venues/${venue.id}/edit`} />}>
          Edit
        </Button>
        <DeleteVenueButton venueId={venue.id} venueName={venue.name} />
      </CardFooter>
    </Card>
  )
}
