'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { eventSchema, type EventFormValues } from '@/lib/validations'
import type { SportType, EventWithVenues } from '@/lib/types'
import { createEvent, updateEvent } from '@/actions/events'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VenueFieldArray } from '@/components/venues/VenueFieldArray'
import { CreateSportDialog } from '@/components/events/CreateSportDialog'

export function EventForm({
  sportTypes: initialSportTypes,
  event,
}: {
  sportTypes: SportType[]
  event?: EventWithVenues
}) {
  const [sportTypes, setSportTypes] = useState(initialSportTypes)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isEditing = !!event

  // Parse existing event data for default values
  const startDate = event
    ? new Date(event.starts_at).toISOString().split('T')[0]
    : ''
  const startTime = event
    ? new Date(event.starts_at).toTimeString().slice(0, 5)
    : ''

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormValues>,
    defaultValues: {
      name: event?.name ?? '',
      sport_type_id: event?.sport_type_id ?? '',
      start_date: startDate,
      start_time: startTime,
      duration_minutes: event?.duration_minutes ?? 60,
      description: event?.description ?? '',
      venues: event?.venues.map((v) => ({
        id: v.id,
        name: v.name,
        address: v.address ?? '',
        city: v.city ?? '',
        state: v.state ?? '',
        capacity: v.capacity ?? '',
      })) ?? [{ name: '', address: '', city: '', state: '', capacity: '' }],
    },
  })

  const { register, handleSubmit, formState: { errors } } = form

  function onSubmit(values: EventFormValues) {
    startTransition(async () => {
      if (isEditing) {
        const { error } = await updateEvent(event.id, values)
        if (error) {
          toast.error(error)
          return
        }
        toast.success('Event updated')
        router.push(`/events/${event.id}`)
      } else {
        const { data, error } = await createEvent(values)
        if (error) {
          toast.error(error)
          return
        }
        toast.success('Event created')
        router.push(`/events/${data}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="space-y-1.5">
        <Label htmlFor="name">Event name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g. Lakers vs Celtics"
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Sport type *</Label>
          <CreateSportDialog
            onCreated={(sport) => {
              setSportTypes((prev) => [...prev, sport].sort((a, b) => a.display_order - b.display_order))
              form.setValue('sport_type_id', sport.id)
            }}
          />
        </div>
        <Controller
          control={form.control}
          name="sport_type_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full" aria-invalid={!!errors.sport_type_id}>
                <SelectValue placeholder="Select a sport">
                  {sportTypes.find((s) => s.id === field.value)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sportTypes.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.sport_type_id && (
          <p className="text-sm text-destructive">{errors.sport_type_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="start_date">Date *</Label>
          <Input
            id="start_date"
            type="date"
            {...register('start_date')}
            aria-invalid={!!errors.start_date}
          />
          {errors.start_date && (
            <p className="text-sm text-destructive">{errors.start_date.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="start_time">Time *</Label>
          <Input
            id="start_time"
            type="time"
            {...register('start_time')}
            aria-invalid={!!errors.start_time}
          />
          {errors.start_time && (
            <p className="text-sm text-destructive">{errors.start_time.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration_minutes">Duration (min) *</Label>
          <Input
            id="duration_minutes"
            type="number"
            {...register('duration_minutes')}
            placeholder="60"
            aria-invalid={!!errors.duration_minutes}
          />
          {errors.duration_minutes && (
            <p className="text-sm text-destructive">{errors.duration_minutes.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Optional event description"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <VenueFieldArray form={form} />

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditing
              ? 'Saving…'
              : 'Creating…'
            : isEditing
              ? 'Save changes'
              : 'Create event'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
