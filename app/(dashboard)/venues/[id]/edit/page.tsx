import { notFound } from 'next/navigation'
import { getVenue } from '@/actions/venues'
import { VenueForm } from '@/components/venues/VenueForm'

export default async function EditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: venue, error } = await getVenue(id)

  if (error || !venue) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Venue</h1>
      <VenueForm venue={venue} />
    </div>
  )
}
