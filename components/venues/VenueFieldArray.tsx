'use client'

import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import type { EventFormValues } from '@/lib/validations'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { VenueSlot } from '@/components/venues/VenueSlot'

export function VenueFieldArray({
  form,
}: {
  form: UseFormReturn<EventFormValues>
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'venues',
  })

  const errors = form.formState.errors

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Venues</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ name: '', address: '', city: '', state: '', capacity: '' })
          }
        >
          <PlusIcon className="mr-1" />
          Add venue
        </Button>
      </div>

      {errors.venues?.root?.message && (
        <p className="text-sm text-destructive">{errors.venues.root.message}</p>
      )}
      {typeof errors.venues?.message === 'string' && (
        <p className="text-sm text-destructive">{errors.venues.message}</p>
      )}

      {fields.map((field, index) => {
        // field.id is react-hook-form's internal key; check the venue id value
        const venueId = form.getValues(`venues.${index}.id`)
        return (
          <VenueSlot
            key={field.id}
            index={index}
            form={form}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
            initialMode={venueId ? 'selected' : 'search'}
          />
        )
      })}
    </div>
  )
}
