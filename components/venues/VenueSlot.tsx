'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormValues } from '@/lib/validations'
import type { Venue } from '@/lib/types'
import { searchVenues, requestVenueImageUploadUrl } from '@/actions/venues'
import { toast } from 'sonner'
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
import { TrashIcon, SearchIcon, PlusIcon, MapPinIcon, UsersIcon, ImageIcon, XIcon } from 'lucide-react'

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

  // Image upload state for create mode
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, startUpload] = useTransition()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [venueImageId, setVenueImageId] = useState<string | null>(null)

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
        zip_code: null,
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
    setIsSearching(true)
    searchVenues(term).then(({ data }) => {
      setResults(data ?? [])
      setIsSearching(false)
    })
  }, [])

  // Load recent venues on mount so the list isn't empty
  useEffect(() => {
    if (mode === 'search') {
      doSearch('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    form.setValue(`venues.${index}.zip_code`, venue.zip_code ?? '')
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
    form.setValue(`venues.${index}.zip_code`, '')
    form.setValue(`venues.${index}.capacity`, '')
    form.setValue(`venues.${index}.cf_image_id`, undefined)
    setMode('search')
  }

  function switchToCreate() {
    form.setValue(`venues.${index}.id`, undefined)
    form.setValue(`venues.${index}.name`, search)
    form.setValue(`venues.${index}.address`, '')
    form.setValue(`venues.${index}.city`, '')
    form.setValue(`venues.${index}.state`, '')
    form.setValue(`venues.${index}.zip_code`, '')
    form.setValue(`venues.${index}.capacity`, '')
    form.setValue(`venues.${index}.cf_image_id`, undefined)
    setVenueImageId(null)
    setImagePreview(null)
    setMode('create')
    setSearch('')
    setResults([])
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImagePreview(URL.createObjectURL(file))

    startUpload(async () => {
      const { data, error } = await requestVenueImageUploadUrl()
      if (error || !data) {
        toast.error(error ?? 'Failed to get upload URL')
        setImagePreview(null)
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch(data.uploadURL, {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        toast.error('Failed to upload image')
        setImagePreview(null)
        return
      }

      setVenueImageId(data.imageId)
      form.setValue(`venues.${index}.cf_image_id`, data.imageId)
      toast.success('Image uploaded')
    })

    e.target.value = ''
  }

  function removeImage() {
    setVenueImageId(null)
    setImagePreview(null)
    form.setValue(`venues.${index}.cf_image_id`, undefined)
  }

  if (mode === 'selected' && selectedVenue) {
    const location = [selectedVenue.city, selectedVenue.state, selectedVenue.zip_code].filter(Boolean).join(', ')
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
      <Card size="sm" onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter') e.preventDefault()
      }}>
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

          {/* Image upload */}
          <div className="space-y-1.5">
            <Label>Image</Label>
            {imagePreview ? (
              <div className="relative h-24 w-full overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="absolute top-1 right-1 bg-background/80 hover:bg-background"
                  onClick={removeImage}
                  disabled={isUploading}
                >
                  <XIcon />
                </Button>
                {isUploading && (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading}
                className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/50 transition-colors hover:bg-muted disabled:opacity-50"
              >
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <ImageIcon className="size-5" />
                  <span className="text-xs">Upload image</span>
                </div>
              </button>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

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

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`venues.${index}.state`}>State</Label>
              <Input
                id={`venues.${index}.state`}
                {...form.register(`venues.${index}.state`)}
                placeholder="State"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`venues.${index}.zip_code`}>Zip code</Label>
              <Input
                id={`venues.${index}.zip_code`}
                {...form.register(`venues.${index}.zip_code`)}
                placeholder="e.g. 10001"
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
              <CommandGroup heading={search ? 'Search Results' : 'Recent Venues'}>
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
