import { Suspense } from 'react'
import Link from 'next/link'
import { getEvents } from '@/actions/events'
import { getSportTypes } from '@/actions/sport-types'
import { getProfile } from '@/actions/profile'
import { EventGrid } from '@/components/events/EventGrid'
import { EventTable } from '@/components/events/EventTable'
import { EventSearch } from '@/components/events/EventSearch'
import { ViewToggle } from '@/components/events/ViewToggle'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { PAGE_SIZE } from '@/lib/constants'
import { PlusIcon } from 'lucide-react'
import { WelcomeGreeting } from './WelcomeGreeting'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    sport?: string
    view?: string
    page?: string
    sort?: string
    order?: string
    status?: string
    welcome?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const [eventsResult, sportTypesResult] = await Promise.all([
    getEvents({
      search: params.q,
      sport: params.sport,
      page,
      sortBy: (params.sort as 'starts_at' | 'name') || undefined,
      sortDir: (params.order as 'asc' | 'desc') || undefined,
      status: (params.status as 'active' | 'cancelled' | 'all') || undefined,
    }),
    getSportTypes(),
  ])

  const { items: events, total } = eventsResult.data ?? { items: [], total: 0 }
  const sportTypes = sportTypesResult.data ?? []
  const view = params.view ?? 'grid'

  // For OAuth callback welcome toast
  let welcomeName: string | null = null
  if (params.welcome === '1') {
    const { data: profile } = await getProfile()
    welcomeName = profile?.first_name ?? null
  }

  return (
    <div className="space-y-6">
      {params.welcome === '1' && (
        <WelcomeGreeting firstName={welcomeName} />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <div className="flex items-center gap-2">
          <Suspense>
            <EventSearch sportTypes={sportTypes} />
          </Suspense>
          <Suspense>
            <ViewToggle />
          </Suspense>
          <Button size="sm" render={<Link href="/events/new" />}>
            <PlusIcon className="mr-1" />
            New Event
          </Button>
        </div>
      </div>

      {view === 'list' ? (
        <EventTable events={events} />
      ) : (
        <EventGrid events={events} />
      )}

      <Suspense>
        <Pagination currentPage={page} total={total} pageSize={PAGE_SIZE} />
      </Suspense>
    </div>
  )
}
