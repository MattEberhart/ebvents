import { z } from 'zod'

export const venueSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Venue name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  cf_image_id: z.string().optional(),
  capacity: z.coerce
    .number()
    .positive('Capacity must be positive')
    .optional()
    .or(z.literal('')),
})

export const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(100),
  sport_type_id: z.string().min(1, 'Sport type is required'),
  start_date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Time is required'),
  duration_minutes: z.coerce.number().min(1, 'Duration is required').max(1440),
  description: z.string().max(500).optional(),
  venues: z.array(venueSchema).min(1, 'At least one venue is required'),
})

export const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().max(50).optional(),
})

export const sportTypeSchema = z.object({
  name: z.string().min(1, 'Sport name is required').max(50),
})

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const otpRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
})

export const otpVerifySchema = z.object({
  token: z.string().length(8, 'Code must be 8 digits').regex(/^\d{8}$/, 'Code must be 8 digits'),
})

export type EventFormValues = z.infer<typeof eventSchema>
export type VenueFormValues = z.infer<typeof venueSchema>
export type ProfileFormValues = z.infer<typeof profileSchema>
export type SportTypeFormValues = z.infer<typeof sportTypeSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
export type SignupFormValues = z.infer<typeof signupSchema>
export type OtpRequestFormValues = z.infer<typeof otpRequestSchema>
export type OtpVerifyFormValues = z.infer<typeof otpVerifySchema>
