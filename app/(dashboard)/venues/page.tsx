import { Suspense } from 'react'
import { getVenues } from '@/actions/venues'
import { VenueGrid } from '@/components/venues/VenueGrid'
import { VenueTable } from '@/components/venues/VenueTable'
import { VenueSearch } from '@/components/venues/VenueSearch'
import { ViewToggle } from '@/components/events/ViewToggle'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { PAGE_SIZE } from '@/lib/constants'
import Link from 'next/link'

export default async function VenuesDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    view?: string
    page?: string
    sort?: string
    order?: string
    capacity?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  // Parse capacity range param (e.g. "1000-10000", "50000-")
  let capacityMin: number | undefined
  let capacityMax: number | undefined
  if (params.capacity) {
    const [min, max] = params.capacity.split('-')
    if (min) capacityMin = parseInt(min, 10) || undefined
    if (max) capacityMax = parseInt(max, 10) || undefined
  }

  const { data } = await getVenues({
    search: params.q,
    page,
    sortBy: (params.sort as 'name' | 'capacity') || undefined,
    sortDir: (params.order as 'asc' | 'desc') || undefined,
    capacityMin,
    capacityMax,
  })
  const venues = data?.items ?? []
  const total = data?.total ?? 0
  const view = params.view ?? 'grid'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Venues</h1>
        <div className="flex items-center gap-2">
          <Suspense>
            <VenueSearch />
          </Suspense>
          <Suspense>
            <ViewToggle basePath="/venues" />
          </Suspense>
          <Button size="sm" render={<Link href="/venues/new" />}>
            New Venue
          </Button>
        </div>
      </div>

      {view === 'list' ? (
        <VenueTable venues={venues} />
      ) : (
        <VenueGrid venues={venues} />
      )}

      <Suspense>
        <Pagination currentPage={page} total={total} pageSize={PAGE_SIZE} />
      </Suspense>
    </div>
  )
}
