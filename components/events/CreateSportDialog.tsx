'use client'

import { useTransition } from 'react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { sportTypeSchema, type SportTypeFormValues } from '@/lib/validations'
import type { SportType } from '@/lib/types'
import { createSportType } from '@/actions/sport-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
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

  const form = useForm<SportTypeFormValues>({
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
      form.reset()
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
        <form onSubmit={(e) => { e.stopPropagation(); form.handleSubmit(onSubmit)(e) }}>
          <DialogHeader>
            <DialogTitle>Create sport type</DialogTitle>
            <DialogDescription>
              Add a new sport type. Duplicate names are not allowed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sport-name">Sport name *</FieldLabel>
                  <Input id="sport-name" placeholder="e.g. Pickleball" aria-invalid={fieldState.invalid} {...field} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
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
