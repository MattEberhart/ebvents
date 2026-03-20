'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { signIn, signInWithGoogle, signInWithOtp, verifyOtp } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type AuthMode = 'password' | 'otp' | 'otp-verify'

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<AuthMode>('password')
  const [otpEmail, setOtpEmail] = useState('')
  const router = useRouter()

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const { error } = await signIn(formData)
      if (error) {
        toast.error(error)
        return
      }
      toast.success('Welcome back!')
      router.push('/')
      router.refresh()
    })
  }

  function handleOtpRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    setOtpEmail(email)

    startTransition(async () => {
      const { error } = await signInWithOtp(formData)
      if (error) {
        toast.error(error)
        return
      }
      toast.success('Check your email for a login code')
      setMode('otp-verify')
    })
  }

  function handleOtpVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('email', otpEmail)

    startTransition(async () => {
      const { error } = await verifyOtp(formData)
      if (error) {
        toast.error(error)
        return
      }
      toast.success('Welcome back!')
      router.push('/')
      router.refresh()
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
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'password' && (
            <>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
              <button
                type="button"
                onClick={() => setMode('otp')}
                className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
              >
                Sign in with email code instead
              </button>
            </>
          )}

          {mode === 'otp' && (
            <>
              <form onSubmit={handleOtpRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp-email">Email</Label>
                  <Input
                    id="otp-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    defaultValue={otpEmail}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Sending code…' : 'Send login code'}
                </Button>
              </form>
              <button
                type="button"
                onClick={() => setMode('password')}
                className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
              >
                Sign in with password instead
              </button>
            </>
          )}

          {mode === 'otp-verify' && (
            <>
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to <span className="font-medium text-foreground">{otpEmail}</span>
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="token">Verification code</Label>
                  <Input
                    id="token"
                    name="token"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
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
                onClick={() => setMode('otp')}
                className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
              >
                Resend code
              </button>
            </>
          )}

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
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary underline underline-offset-4 hover:text-primary/80">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
