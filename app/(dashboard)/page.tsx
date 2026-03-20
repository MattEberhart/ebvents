import { Suspense } from 'react'
import { getEvents, getSportTypes } from '@/actions/events'
import { EventGrid } from '@/components/events/EventGrid'
import { EventTable } from '@/components/events/EventTable'
import { EventSearch } from '@/components/events/EventSearch'
import { ViewToggle } from '@/components/events/ViewToggle'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sport?: string; view?: string }>
}) {
  const params = await searchParams

  const [eventsResult, sportTypesResult] = await Promise.all([
    getEvents({ search: params.q, sport: params.sport }),
    getSportTypes(),
  ])

  const events = eventsResult.data ?? []
  const sportTypes = sportTypesResult.data ?? []
  const view = params.view ?? 'grid'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <div className="flex items-center gap-2">
          <Suspense>
            <EventSearch sportTypes={sportTypes} />
          </Suspense>
          <Suspense>
            <ViewToggle />
          </Suspense>
        </div>
      </div>

      {view === 'list' ? (
        <EventTable events={events} />
      ) : (
        <EventGrid events={events} />
      )}
    </div>
  )
}
