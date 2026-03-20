'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'

export function VenueSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      startTransition(() => {
        router.push(`/venues?${params.toString()}`)
      })
    },
    [router, searchParams, startTransition],
  )

  return (
    <div className="relative flex-1">
      <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        placeholder="Search venues…"
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(e) => updateSearch(e.target.value)}
        className="pl-8"
      />
    </div>
  )
}
