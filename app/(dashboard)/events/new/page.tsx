import { getSportTypes } from '@/actions/events'
import { EventForm } from '@/components/events/EventForm'

export default async function NewEventPage() {
  const { data: sportTypes } = await getSportTypes()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Create Event</h1>
      <EventForm sportTypes={sportTypes ?? []} />
    </div>
  )
}
