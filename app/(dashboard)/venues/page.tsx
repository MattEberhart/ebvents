import { Suspense } from 'react'
import { getVenues } from '@/actions/venues'
import { VenueGrid } from '@/components/venues/VenueGrid'
import { VenueSearch } from '@/components/venues/VenueSearch'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function VenuesDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const { data: venues } = await getVenues(params.q)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Venues</h1>
        <div className="flex items-center gap-2">
          <Suspense>
            <VenueSearch />
          </Suspense>
          <Button size="sm" render={<Link href="/venues/new" />}>
            New Venue
          </Button>
        </div>
      </div>

      <VenueGrid venues={venues ?? []} />
    </div>
  )
}
