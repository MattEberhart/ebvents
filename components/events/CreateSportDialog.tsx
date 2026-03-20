'use client'

import { useTransition } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { sportTypeSchema, type SportTypeFormValues } from '@/lib/validations'
import type { SportType } from '@/lib/types'
import { createSportType } from '@/actions/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

export function CreateSportDialog({
  onCreated,
}: {
  onCreated: (sport: SportType) => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SportTypeFormValues>({
    resolver: zodResolver(sportTypeSchema) as unknown as Resolver<SportTypeFormValues>,
    defaultValues: { name: '' },
  })

  function onSubmit(values: SportTypeFormValues) {
    startTransition(async () => {
      const { data, error } = await createSportType(values.name)
      if (error) {
        toast.error(error)
        return
      }
      toast.success(`"${data!.name}" sport created`)
      onCreated(data!)
      reset()
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <PlusIcon className="mr-1" />
            New sport
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create sport type</DialogTitle>
            <DialogDescription>
              Add a new sport type. Duplicate names are not allowed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-1.5">
            <Label htmlFor="sport-name">Sport name *</Label>
            <Input
              id="sport-name"
              {...register('name')}
              placeholder="e.g. Pickleball"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating…' : 'Create sport'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
