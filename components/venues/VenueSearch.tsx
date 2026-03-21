'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

const CAPACITY_RANGES = [
  { label: 'Any capacity', value: '' },
  { label: 'Under 1,000', value: '0-1000' },
  { label: '1,000 – 10,000', value: '1000-10000' },
  { label: '10,000 – 50,000', value: '10000-50000' },
  { label: '50,000+', value: '50000-' },
]

export function VenueSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const sortBy = searchParams.get('sort') ?? 'name'
  const sortDir = searchParams.get('order') ?? 'asc'
  const capacity = searchParams.get('capacity') ?? ''

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      startTransition(() => {
        router.push(`/venues?${params.toString()}`)
      })
    },
    [router, searchParams, startTransition],
  )

  const debouncedSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => updateParams('q', value), 300)
    },
    [updateParams],
  )

  function toggleSortDir() {
    updateParams('order', sortDir === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search venues…"
          defaultValue={searchParams.get('q') ?? ''}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select
        value={capacity}
        onValueChange={(value) => updateParams('capacity', value ?? '')}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Any capacity" />
        </SelectTrigger>
        <SelectContent>
          {CAPACITY_RANGES.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-1">
        <Select
          value={sortBy}
          onValueChange={(value) => updateParams('sort', value ?? '')}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue>
              Sort by: {sortBy === 'name' ? 'Name' : 'Capacity'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="capacity">Capacity</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon-xs"
          onClick={toggleSortDir}
          aria-label={sortDir === 'asc' ? 'Sort ascending' : 'Sort descending'}
        >
          {sortDir === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </Button>
      </div>
    </div>
  )
}
