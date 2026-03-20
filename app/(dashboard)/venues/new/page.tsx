import { VenueForm } from '@/components/venues/VenueForm'

export default function NewVenuePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">New Venue</h1>
      <VenueForm />
    </div>
  )
}
