import { notFound } from 'next/navigation'
import { getVenue } from '@/actions/venues'
import { getCfImageUrl } from '@/lib/cloudflare'
import { VenueForm } from '@/components/venues/VenueForm'

export default async function EditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: venue, error } = await getVenue(id)

  if (error || !venue) notFound()

  const imageUrl = venue.cf_image_id ? getCfImageUrl(venue.cf_image_id) : null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Venue</h1>
      <VenueForm venue={venue} initialImageUrl={imageUrl} />
    </div>
  )
}
