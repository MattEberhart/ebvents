'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  signupSchema, type SignupFormValues,
  otpVerifySchema, type OtpVerifyFormValues,
} from '@/lib/validations'
import { signUp, signInWithGoogle, verifySignupOtp, resendSignupConfirmation } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'

type SignupMode = 'signup' | 'verify'

export default function SignUpPage() {
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<SignupMode>('signup')
  const [signupEmail, setSignupEmail] = useState('')

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema) as unknown as Resolver<SignupFormValues>,
    defaultValues: { first_name: '', last_name: '', email: '', password: '' },
  })

  const verifyForm = useForm<OtpVerifyFormValues>({
    resolver: zodResolver(otpVerifySchema) as unknown as Resolver<OtpVerifyFormValues>,
    defaultValues: { token: '' },
  })

  function handleSubmit(values: SignupFormValues) {
    const formData = new FormData()
    formData.set('first_name', values.first_name)
    formData.set('last_name', values.last_name ?? '')
    formData.set('email', values.email)
    formData.set('password', values.password)

    startTransition(async () => {
      const { error } = await signUp(formData)
      if (error) {
        toast.error(error)
        return
      }
      setSignupEmail(values.email)
      setMode('verify')
      toast.success('Account created! Check your email for a confirmation code.')
    })
  }

  function handleVerify(values: OtpVerifyFormValues) {
    const formData = new FormData()
    formData.set('email', signupEmail)
    formData.set('token', values.token)

    startTransition(async () => {
      const { error } = await verifySignupOtp(formData)
      if (error) {
        toast.error(error)
        return
      }
      window.location.href = '/?welcome=1'
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
              <form onSubmit={signupForm.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    control={signupForm.control}
                    name="first_name"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signup-first-name">First name</FieldLabel>
                        <Input
                          id="signup-first-name"
                          placeholder="Jane"
                          autoComplete="given-name"
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                  <Controller
                    control={signupForm.control}
                    name="last_name"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signup-last-name">Last name</FieldLabel>
                        <Input
                          id="signup-last-name"
                          placeholder="Doe"
                          autoComplete="family-name"
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  control={signupForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                      <Input
                        id="signup-email"
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
                  control={signupForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                      <Input
                        id="signup-password"
                        type="password"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
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
              <form onSubmit={verifyForm.handleSubmit(handleVerify)} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We sent an 8-digit code to <span className="font-medium text-foreground">{signupEmail}</span>
                </p>
                <Controller
                  control={verifyForm.control}
                  name="token"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="signup-token">Verification code</FieldLabel>
                      <Input
                        id="signup-token"
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
