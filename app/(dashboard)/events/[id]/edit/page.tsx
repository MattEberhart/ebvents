import { notFound } from 'next/navigation'
import { getEvent } from '@/actions/events'
import { getSportTypes } from '@/actions/sport-types'
import { EventForm } from '@/components/events/EventForm'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [eventResult, sportTypesResult] = await Promise.all([
    getEvent(id),
    getSportTypes(),
  ])

  if (eventResult.error || !eventResult.data) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Event</h1>
      <EventForm
        sportTypes={sportTypesResult.data ?? []}
        event={eventResult.data}
      />
    </div>
  )
}
