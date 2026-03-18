'use client'

import { useRef, useTransition } from 'react'
import { toast } from 'sonner'
import { requestAvatarUploadUrl, confirmAvatarUpload } from '@/actions/profile'

interface AvatarUploadProps {
  avatarUrl: string | null
  firstName: string | null
}

export default function AvatarUpload({ avatarUrl, firstName }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const initials = firstName?.[0]?.toUpperCase() ?? '?'

  function handleClick() {
    inputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    startTransition(async () => {
      const { data, error } = await requestAvatarUploadUrl()
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

      const { error: confirmError } = await confirmAvatarUpload(data.imageId)
      if (confirmError) {
        toast.error(confirmError)
        return
      }

      toast.success('Avatar updated')
    })

    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
        title="Change avatar"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          initials
        )}
        {isPending && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
