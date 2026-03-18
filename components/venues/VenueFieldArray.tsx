'use client'

import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import type { EventFormValues } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlusIcon, TrashIcon } from 'lucide-react'

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

      {fields.map((field, index) => (
        <Card key={field.id} size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Venue {index + 1}
              </span>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => remove(index)}
                >
                  <TrashIcon />
                </Button>
              )}
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
      ))}
    </div>
  )
}
