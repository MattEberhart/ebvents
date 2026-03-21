'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { venueSchema, type VenueFormValues } from '@/lib/validations'
import type { Venue } from '@/lib/types'
import { createVenue, updateVenue, requestVenueImageUploadUrl } from '@/actions/venues'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ImageIcon, XIcon } from 'lucide-react'

export function VenueForm({ venue, initialImageUrl }: { venue?: Venue; initialImageUrl?: string | null }) {
  const [isPending, startTransition] = useTransition()
  const [isUploading, startUpload] = useTransition()
  const router = useRouter()
  const isEditing = !!venue
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [imageId, setImageId] = useState<string | null>(venue?.cf_image_id ?? null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl ?? null)

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

      setImageId(data.imageId)
      toast.success('Image uploaded')
    })

    e.target.value = ''
  }

  function removeImage() {
    setImageId(null)
    setImagePreview(null)
  }

  function onSubmit(values: VenueFormValues) {
    startTransition(async () => {
      if (isEditing) {
        const { error } = await updateVenue(venue.id, values, imageId ?? undefined)
        if (error) {
          toast.error(error)
          return
        }
        toast.success('Venue updated')
        router.push(`/venues/${venue.id}`)
      } else {
        const { data, error } = await createVenue(values, imageId ?? undefined)
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
      {/* Image upload */}
      <div className="space-y-1.5">
        <Label>Venue image</Label>
        {imagePreview ? (
          <div className="relative h-32 w-full overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt=""
              className="h-full w-full object-cover"
            />
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
            className="flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/50 transition-colors hover:bg-muted disabled:opacity-50"
          >
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImageIcon className="size-6" />
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
        <Button type="submit" disabled={isPending || isUploading}>
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
