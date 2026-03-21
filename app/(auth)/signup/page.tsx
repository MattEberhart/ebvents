'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { signUp, signInWithGoogle, verifySignupOtp, resendSignupConfirmation } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type SignupMode = 'signup' | 'verify'

export default function SignUpPage() {
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<SignupMode>('signup')
  const [signupEmail, setSignupEmail] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    startTransition(async () => {
      const { error } = await signUp(formData)
      if (error) {
        toast.error(error)
        return
      }
      setSignupEmail(email)
      setMode('verify')
      toast.success('Account created! Check your email for a confirmation code.')
    })
  }

  function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('email', signupEmail)

    startTransition(async () => {
      const { error } = await verifySignupOtp(formData)
      if (error) {
        toast.error(error)
        return
      }
      toast.success('Email confirmed! Welcome to ebvents.')
      router.push('/')
      router.refresh()
    })
  }

  function handleResend() {
    const formData = new FormData()
    formData.set('email', signupEmail)

    startTransition(async () => {
      const { error } = await resendSignupConfirmation(formData)
      if (error) {
        toast.error(error)
        return
      }
      toast.success('Confirmation code resent — check your email.')
    })
  }

  function handleGoogle() {
    startTransition(async () => {
      const { data, error } = await signInWithGoogle()
      if (error) {
        toast.error(error)
        return
      }
      if (data) window.location.href = data
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            ebvents
          </CardTitle>
          <CardDescription>
            {mode === 'signup' ? 'Create a new account' : 'Confirm your email'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'signup' && (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="first_name">First name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      placeholder="Jane"
                      required
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last_name">Last name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      placeholder="Doe"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Creating account…' : 'Sign up'}
                </Button>
              </form>
              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  or
                </span>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogle}
                disabled={isPending}
              >
                Continue with Google
              </Button>
            </>
          )}

          {mode === 'verify' && (
            <>
              <form onSubmit={handleVerify} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We sent an 8-digit code to <span className="font-medium text-foreground">{signupEmail}</span>
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="token">Verification code</Label>
                  <Input
                    id="token"
                    name="token"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{8}"
                    maxLength={8}
                    placeholder="00000000"
                    required
                    autoComplete="one-time-code"
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Verifying…' : 'Verify code'}
                </Button>
              </form>
              <button
                type="button"
                onClick={handleResend}
                disabled={isPending}
                className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
              >
                Resend code
              </button>
            </>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary underline underline-offset-4 hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
