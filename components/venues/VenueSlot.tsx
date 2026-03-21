'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormValues } from '@/lib/validations'
import type { Venue } from '@/lib/types'
import { searchVenues } from '@/actions/venues'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { TrashIcon, SearchIcon, PlusIcon, MapPinIcon, UsersIcon } from 'lucide-react'

type SlotMode = 'search' | 'create' | 'selected'

interface VenueSlotProps {
  index: number
  form: UseFormReturn<EventFormValues>
  onRemove: () => void
  canRemove: boolean
  initialMode: SlotMode
}

export function VenueSlot({ index, form, onRemove, canRemove, initialMode }: VenueSlotProps) {
  const [mode, setMode] = useState<SlotMode>(initialMode)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Venue[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const errors = form.formState.errors

  // Load selected venue info on mount if we have an id
  const venueId = form.getValues(`venues.${index}.id`)
  const venueName = form.getValues(`venues.${index}.name`)

  useEffect(() => {
    if (initialMode === 'selected' && venueId) {
      setSelectedVenue({
        id: venueId,
        name: venueName ?? '',
        address: form.getValues(`venues.${index}.address`) ?? null,
        city: form.getValues(`venues.${index}.city`) ?? null,
        state: form.getValues(`venues.${index}.state`) ?? null,
        capacity: form.getValues(`venues.${index}.capacity`) as number | null ?? null,
        cf_image_id: null,
        latitude: null,
        longitude: null,
        created_by: null,
        created_at: '',
        updated_at: '',
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const doSearch = useCallback((term: string) => {
    if (!term.trim()) {
      setResults([])
      return
    }
    setIsSearching(true)
    searchVenues(term).then(({ data }) => {
      setResults(data ?? [])
      setIsSearching(false)
    })
  }, [])

  function handleSearchChange(value: string) {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  function selectVenue(venue: Venue) {
    setSelectedVenue(venue)
    form.setValue(`venues.${index}.id`, venue.id)
    form.setValue(`venues.${index}.name`, venue.name)
    form.setValue(`venues.${index}.address`, venue.address ?? '')
    form.setValue(`venues.${index}.city`, venue.city ?? '')
    form.setValue(`venues.${index}.state`, venue.state ?? '')
    form.setValue(`venues.${index}.capacity`, venue.capacity ?? '')
    form.clearErrors(`venues.${index}`)
    setMode('selected')
    setSearch('')
    setResults([])
  }

  function handleChange() {
    setSelectedVenue(null)
    form.setValue(`venues.${index}.id`, undefined)
    form.setValue(`venues.${index}.name`, '')
    form.setValue(`venues.${index}.address`, '')
    form.setValue(`venues.${index}.city`, '')
    form.setValue(`venues.${index}.state`, '')
    form.setValue(`venues.${index}.capacity`, '')
    setMode('search')
  }

  function switchToCreate() {
    form.setValue(`venues.${index}.id`, undefined)
    form.setValue(`venues.${index}.name`, search)
    form.setValue(`venues.${index}.address`, '')
    form.setValue(`venues.${index}.city`, '')
    form.setValue(`venues.${index}.state`, '')
    form.setValue(`venues.${index}.capacity`, '')
    setMode('create')
    setSearch('')
    setResults([])
  }

  if (mode === 'selected' && selectedVenue) {
    const location = [selectedVenue.city, selectedVenue.state].filter(Boolean).join(', ')
    return (
      <Card size="sm">
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Venue {index + 1}
            </span>
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={handleChange}>
                Change
              </Button>
              {canRemove && (
                <Button type="button" variant="ghost" size="icon-xs" onClick={onRemove}>
                  <TrashIcon />
                </Button>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-start gap-3 rounded-md border bg-muted/50 p-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{selectedVenue.name}</p>
              {location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPinIcon className="size-3" />
                  {location}
                </p>
              )}
              {selectedVenue.capacity && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <UsersIcon className="size-3" />
                  {selectedVenue.capacity.toLocaleString()} capacity
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (mode === 'create') {
    return (
      <Card size="sm">
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Venue {index + 1} (new)
            </span>
            <div className="flex items-center gap-1">
              {canRemove && (
                <Button type="button" variant="ghost" size="icon-xs" onClick={onRemove}>
                  <TrashIcon />
                </Button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMode('search')}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <SearchIcon className="size-3" />
            Search existing venues instead
          </button>

          <div className="space-y-1.5">
            <Label htmlFor={`venues.${index}.name`}>Name *</Label>
            <Input
              id={`venues.${index}.name`}
              {...form.register(`venues.${index}.name`)}
              placeholder="Venue name"
              aria-invalid={!!errors.venues?.[index]?.name}
            />
            {errors.venues?.[index]?.name && (
              <p className="text-sm text-destructive">
                {errors.venues[index].name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`venues.${index}.address`}>Address</Label>
              <Input
                id={`venues.${index}.address`}
                {...form.register(`venues.${index}.address`)}
                placeholder="Street address"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`venues.${index}.city`}>City</Label>
              <Input
                id={`venues.${index}.city`}
                {...form.register(`venues.${index}.city`)}
                placeholder="City"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`venues.${index}.state`}>State</Label>
              <Input
                id={`venues.${index}.state`}
                {...form.register(`venues.${index}.state`)}
                placeholder="State"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`venues.${index}.capacity`}>Capacity</Label>
              <Input
                id={`venues.${index}.capacity`}
                type="number"
                {...form.register(`venues.${index}.capacity`)}
                placeholder="e.g. 50000"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Search mode (default)
  return (
    <Card size="sm">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Venue {index + 1}
          </span>
          {canRemove && (
            <Button type="button" variant="ghost" size="icon-xs" onClick={onRemove}>
              <TrashIcon />
            </Button>
          )}
        </div>

        {errors.venues?.[index]?.name && (
          <p className="text-sm text-destructive">
            {errors.venues[index].name.message}
          </p>
        )}

        <Command shouldFilter={false} className="rounded-lg border">
          <CommandInput
            placeholder="Search venues…"
            value={search}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {isSearching && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Searching…
              </div>
            )}
            {!isSearching && search && results.length === 0 && (
              <CommandEmpty>No venues found.</CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup>
                {results.map((venue) => {
                  const location = [venue.city, venue.state].filter(Boolean).join(', ')
                  return (
                    <CommandItem
                      key={venue.id}
                      value={venue.id}
                      onSelect={() => selectVenue(venue)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{venue.name}</p>
                        {location && (
                          <p className="text-xs text-muted-foreground">{location}</p>
                        )}
                      </div>
                      {venue.capacity && (
                        <span className="text-xs text-muted-foreground">
                          {venue.capacity.toLocaleString()}
                        </span>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>

        <button
          type="button"
          onClick={switchToCreate}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <PlusIcon className="size-3" />
          Or create a new venue
        </button>
      </CardContent>
    </Card>
  )
}
