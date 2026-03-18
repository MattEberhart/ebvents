import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEvent, getSportTypes } from '@/actions/events'
import { EventForm } from '@/components/events/EventForm'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [eventResult, sportTypesResult] = await Promise.all([
    getEvent(id),
    getSportTypes(),
  ])

  if (eventResult.error || !eventResult.data) notFound()

  // Only the owner can edit
  if (eventResult.data.user_id !== user?.id) redirect('/')

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
