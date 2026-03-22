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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="event-name">Event name *</FieldLabel>
            <Input id="event-name" placeholder="e.g. Lakers vs Celtics" aria-invalid={fieldState.invalid} {...field} />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="sport_type_id"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <div className="flex items-center justify-between">
              <FieldLabel>Sport type *</FieldLabel>
              <CreateSportDialog
                onCreated={(sport) => {
                  setSportTypes((prev) => [...prev, sport].sort((a, b) => a.display_order - b.display_order))
                  form.setValue('sport_type_id', sport.id)
                }}
              />
            </div>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
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
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Controller
          control={form.control}
          name="start_date"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="start-date">Date *</FieldLabel>
              <Input id="start-date" type="date" aria-invalid={fieldState.invalid} {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="start_time"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="start-time">Time *</FieldLabel>
              <Input id="start-time" type="time" aria-invalid={fieldState.invalid} {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="duration_minutes"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="duration">Duration (min) *</FieldLabel>
              <Input id="duration" type="number" placeholder="60" aria-invalid={fieldState.invalid} {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>

      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              placeholder="Optional event description"
              rows={3}
              aria-invalid={fieldState.invalid}
              {...field}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

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
