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
import type { SportType } from '@/lib/types'
import { SearchIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

export function EventSearch({ sportTypes }: { sportTypes: SportType[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const sortBy = searchParams.get('sort') ?? 'starts_at'
  const sortDir = searchParams.get('order') ?? 'desc'
  const status = searchParams.get('status') ?? 'all'

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
        router.push(`/?${params.toString()}`)
      })
    },
    [router, searchParams, startTransition]
  )

  const debouncedSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => updateParams('q', value), 300)
    },
    [updateParams]
  )

  function toggleSortDir() {
    updateParams('order', sortDir === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search events…"
          defaultValue={searchParams.get('q') ?? ''}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select
        value={searchParams.get('sport') ?? undefined}
        onValueChange={(value) => updateParams('sport', value ?? '')}
      >
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="All sports" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All sports</SelectItem>
          {sportTypes.map((st) => (
            <SelectItem key={st.id} value={st.id}>
              {st.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={status}
        onValueChange={(value) => updateParams('status', value ?? '')}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-1">
        <Select
          value={sortBy}
          onValueChange={(value) => updateParams('sort', value ?? '')}
        >
          <SelectTrigger className="w-full sm:w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="starts_at">Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
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
