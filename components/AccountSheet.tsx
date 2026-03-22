'use client'

import { useRef, useState, useTransition } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { profileSchema, type ProfileFormValues } from '@/lib/validations'
import { updateProfile, requestAvatarUploadUrl, confirmAvatarUpload } from '@/actions/profile'
import { signOut } from '@/actions/auth'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CameraIcon, LogOutIcon } from 'lucide-react'

interface AccountSheetProps {
  avatarUrl: string | null
  firstName: string | null
  lastName: string | null
  email: string
}

export function AccountSheet({ avatarUrl, firstName, lastName, email }: AccountSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, startUpload] = useTransition()
  const [isPending, startTransition] = useTransition()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [imgError, setImgError] = useState(false)
  const initials = firstName?.[0]?.toUpperCase() ?? '?'
  const displayAvatar = previewUrl ?? avatarUrl

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as unknown as Resolver<ProfileFormValues>,
    defaultValues: {
      first_name: firstName ?? '',
      last_name: lastName ?? '',
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    setImgError(false)
    setPreviewUrl(URL.createObjectURL(file))

    startUpload(async () => {
      const { data, error } = await requestAvatarUploadUrl()
      if (error || !data) {
        toast.error(error ?? 'Failed to get upload URL')
        setPreviewUrl(null)
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
        setPreviewUrl(null)
        return
      }

      const { error: confirmError } = await confirmAvatarUpload(data.imageId)
      if (confirmError) {
        toast.error(confirmError)
        setPreviewUrl(null)
        return
      }

      toast.success('Avatar updated')
    })

    e.target.value = ''
  }

  function onSubmit(values: ProfileFormValues) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set('first_name', values.first_name)
      formData.set('last_name', values.last_name ?? '')

      const { error } = await updateProfile(formData)
      if (error) {
        toast.error(error)
        return
      }
      toast.success('Profile updated')
    })
  }

  return (
    <Sheet>
      <SheetTrigger
        className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {avatarUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          initials
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Account</SheetTitle>
          <SheetDescription>{email}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Avatar section */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-medium text-muted-foreground ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {displayAvatar && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayAvatar}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                initials
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                <CameraIcon className="size-5 text-white" />
              </span>
              {isUploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </span>
              )}
            </button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              <CameraIcon className="mr-1" />
              Change photo
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Profile form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="account-first-name">First name *</Label>
              <Input
                id="account-first-name"
                {...register('first_name')}
                placeholder="First name"
                aria-invalid={!!errors.first_name}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="account-last-name">Last name</Label>
              <Input
                id="account-last-name"
                {...register('last_name')}
                placeholder="Last name"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>

          <Separator />

          <form action={signOut}>
            <Button variant="ghost" className="w-full justify-start text-destructive" type="submit">
              <LogOutIcon className="mr-2 size-4" />
              Sign out
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
