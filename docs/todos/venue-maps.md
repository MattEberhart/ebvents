# Venue Maps

## What it does
Display an interactive map (Google Maps or Mapbox) on venue details showing the venue's location. Optionally show a mini-map on event cards and a multi-pin map on the dashboard.

## Why it's valuable
Visual location context makes venues tangible. Users can quickly assess distance and surroundings without leaving the app.

## Implementation notes
- Depends on `google-places-autocomplete` feature for lat/lng data on venues
- Use `@react-google-maps/api` or `react-map-gl` (Mapbox) as the map component
- Client component: `VenueMap` renders a map centered on venue coordinates with a marker
- Embed `VenueMap` on the event detail page below venue info
- Dashboard map view: optional toggle to show all events on a single map with clustered markers
- Env var: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (shared with Places) or `NEXT_PUBLIC_MAPBOX_TOKEN`
- Fallback: if no coordinates exist for a venue, show a static "No location data" placeholder
- Lazy-load the map component to avoid impacting initial page load performance
