'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SportType } from '@/lib/types'
import { SearchIcon } from 'lucide-react'

export function EventSearch({ sportTypes }: { sportTypes: SportType[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.push(`/?${params.toString()}`)
      })
    },
    [router, searchParams, startTransition]
  )

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search events…"
          defaultValue={searchParams.get('q') ?? ''}
          onChange={(e) => updateParams('q', e.target.value)}
          className="pl-8"
        />
      </div>
      <Select
        value={searchParams.get('sport') ?? undefined}
        onValueChange={(value) => updateParams('sport', value as string)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
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
    </div>
  )
}
