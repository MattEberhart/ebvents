'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { safeAction, type ActionResult } from '@/lib/utils'

export async function signUp(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string | null

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName || null },
      },
    })

    if (error) throw error
  })
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  })
}

export async function signInWithGoogle(): Promise<ActionResult<string>> {
  return safeAction(async () => {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) throw error
    return data.url
  })
}

export async function signInWithOtp(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    })

    if (error) throw error
  })
}

export async function verifyOtp(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const token = formData.get('token') as string

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) throw error
  })
}

export async function verifySignupOtp(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const token = formData.get('token') as string

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    })

    if (error) throw error
  })
}

export async function resendSignupConfirmation(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const supabase = await createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) throw error
  })
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
