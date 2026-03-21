'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { reactivateEvent } from '@/actions/events'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function ReactivateEventButton({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleReactivate() {
    startTransition(async () => {
      const { error } = await reactivateEvent(eventId)
      if (error) {
        toast.error(error)
        return
      }
      toast.success('Event reactivated')
      router.refresh()
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" disabled={isPending}>
            Reactivate
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reactivate event</AlertDialogTitle>
          <AlertDialogDescription>
            This will restore the event to active status. It will be visible
            as an upcoming or past event again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep cancelled</AlertDialogCancel>
          <AlertDialogAction onClick={handleReactivate} disabled={isPending}>
            {isPending ? 'Reactivating\u2026' : 'Reactivate event'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
