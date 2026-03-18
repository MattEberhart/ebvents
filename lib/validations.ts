import { z } from 'zod'

export const venueSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Venue name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
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

export type EventFormValues = z.infer<typeof eventSchema>
export type VenueFormValues = z.infer<typeof venueSchema>
export type ProfileFormValues = z.infer<typeof profileSchema>
