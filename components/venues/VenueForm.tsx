'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { venueSchema, type VenueFormValues } from '@/lib/validations'
import type { Venue } from '@/lib/types'
import { createVenue, updateVenue } from '@/actions/venues'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function VenueForm({ venue }: { venue?: Venue }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isEditing = !!venue

  const { register, handleSubmit, formState: { errors } } = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema) as unknown as Resolver<VenueFormValues>,
    defaultValues: {
      name: venue?.name ?? '',
      address: venue?.address ?? '',
      city: venue?.city ?? '',
      state: venue?.state ?? '',
      capacity: venue?.capacity ?? '',
    },
  })

  function onSubmit(values: VenueFormValues) {
    startTransition(async () => {
      if (isEditing) {
        const { error } = await updateVenue(venue.id, values)
        if (error) {
          toast.error(error)
          return
        }
        toast.success('Venue updated')
        router.push(`/venues/${venue.id}`)
      } else {
        const { data, error } = await createVenue(values)
        if (error) {
          toast.error(error)
          return
        }
        toast.success('Venue created')
        router.push(`/venues/${data}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="space-y-1.5">
        <Label htmlFor="name">Venue name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g. Madison Square Garden"
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="Street address"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="City"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            {...register('state')}
            placeholder="State"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            {...register('capacity')}
            placeholder="e.g. 50000"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditing ? 'Saving…' : 'Creating…'
            : isEditing ? 'Save changes' : 'Create venue'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
