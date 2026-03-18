export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  cf_image_id: string | null
  created_at: string
}

export interface SportType {
  id: string
  name: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Venue {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  capacity: number | null
  latitude: number | null
  longitude: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  user_id: string
  sport_type_id: string
  name: string
  starts_at: string
  duration_minutes: number
  description: string | null
  status: 'active' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface EventWithVenues extends Event {
  sport_type: SportType
  venues: Venue[]
}

export interface VenueWithEvents extends Venue {
  events: EventWithVenues[]
}
