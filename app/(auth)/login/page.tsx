'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  loginSchema, type LoginFormValues,
  otpRequestSchema, type OtpRequestFormValues,
  otpVerifySchema, type OtpVerifyFormValues,
} from '@/lib/validations'
import { signIn, signInWithGoogle, signInWithOtp, verifyOtp } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'

type AuthMode = 'password' | 'otp' | 'otp-verify'

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<AuthMode>('password')
  const [otpEmail, setOtpEmail] = useState('')

  const passwordForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as unknown as Resolver<LoginFormValues>,
    defaultValues: { email: '', password: '' },
  })

  const otpForm = useForm<OtpRequestFormValues>({
    resolver: zodResolver(otpRequestSchema) as unknown as Resolver<OtpRequestFormValues>,
    defaultValues: { email: '' },
  })

  const verifyForm = useForm<OtpVerifyFormValues>({
    resolver: zodResolver(otpVerifySchema) as unknown as Resolver<OtpVerifyFormValues>,
    defaultValues: { token: '' },
  })

  function handlePasswordSubmit(values: LoginFormValues) {
    const formData = new FormData()
    formData.set('email', values.email)
    formData.set('password', values.password)

    startTransition(async () => {
      const { error } = await signIn(formData)
      if (error) {
        toast.error(error)
        return
      }
      window.location.href = '/?welcome=1'
    })
  }

  function handleOtpRequest(values: OtpRequestFormValues) {
    setOtpEmail(values.email)
    const formData = new FormData()
    formData.set('email', values.email)

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

  function handleOtpVerify(values: OtpVerifyFormValues) {
    const formData = new FormData()
    formData.set('email', otpEmail)
    formData.set('token', values.token)

    startTransition(async () => {
      const { error } = await verifyOtp(formData)
      if (error) {
        toast.error(error)
        return
      }
      window.location.href = '/?welcome=1'
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
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                <Controller
                  control={passwordForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="login-email">Email</FieldLabel>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <Controller
                  control={passwordForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="login-password">Password</FieldLabel>
                      <Input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
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
              <form onSubmit={otpForm.handleSubmit(handleOtpRequest)} className="space-y-4">
                <Controller
                  control={otpForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="otp-email">Email</FieldLabel>
                      <Input
                        id="otp-email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
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
              <form onSubmit={verifyForm.handleSubmit(handleOtpVerify)} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We sent an 8-digit code to <span className="font-medium text-foreground">{otpEmail}</span>
                </p>
                <Controller
                  control={verifyForm.control}
                  name="token"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="otp-token">Verification code</FieldLabel>
                      <Input
                        id="otp-token"
                        inputMode="numeric"
                        maxLength={8}
                        placeholder="00000000"
                        autoComplete="one-time-code"
                        className="text-center text-lg tracking-widest"
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
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
