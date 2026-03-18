'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutGridIcon, ListIcon } from 'lucide-react'

export function ViewToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') ?? 'grid'

  function toggle(newView: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', newView)
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex items-center rounded-lg border p-0.5">
      <Button
        variant={view === 'grid' ? 'secondary' : 'ghost'}
        size="icon-xs"
        onClick={() => toggle('grid')}
        aria-label="Grid view"
      >
        <LayoutGridIcon />
      </Button>
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="icon-xs"
        onClick={() => toggle('list')}
        aria-label="List view"
      >
        <ListIcon />
      </Button>
    </div>
  )
}
