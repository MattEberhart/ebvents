'use client'

import { useRef, useTransition } from 'react'
import { toast } from 'sonner'
import { requestVenueImageUploadUrl, confirmVenueImageUpload } from '@/actions/venues'
import { ImageIcon } from 'lucide-react'

interface VenueImageUploadProps {
  venueId: string
  imageUrl: string | null
}

export function VenueImageUpload({ venueId, imageUrl }: VenueImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    inputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    startTransition(async () => {
      const { data, error } = await requestVenueImageUploadUrl()
      if (error || !data) {
        toast.error(error ?? 'Failed to get upload URL')
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
        return
      }

      const { error: confirmError } = await confirmVenueImageUpload(venueId, data.imageId)
      if (confirmError) {
        toast.error(confirmError)
        return
      }

      toast.success('Venue image updated')
    })

    e.target.value = ''
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/50 transition-colors hover:bg-muted disabled:opacity-50"
        title="Upload venue image"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageIcon className="size-6" />
            <span className="text-xs">Upload image</span>
          </div>
        )}
        {isPending && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}
