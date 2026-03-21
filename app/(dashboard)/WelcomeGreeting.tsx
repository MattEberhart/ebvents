'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function WelcomeGreeting({ firstName }: { firstName: string | null }) {
  const router = useRouter()
  const hasShown = useRef(false)

  useEffect(() => {
    if (hasShown.current) return
    hasShown.current = true
    const name = firstName ?? 'there'
    toast.success(`Welcome back, ${name}!`)
    // Clean up the URL param
    router.replace('/')
  }, [firstName, router])

  return null
}
