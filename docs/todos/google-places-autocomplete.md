# Google Places Autocomplete

## What it does
When entering a venue address, an autocomplete dropdown suggests real addresses via the Google Places API. Selecting a suggestion auto-fills the address, city, and optionally coordinates fields.

## Why it's valuable
Ensures accurate, standardized addresses. Reduces typos and speeds up venue entry. Enables future map-based features with reliable geocoded data.

## Implementation notes
- Use `@react-google-maps/api` or the Places Autocomplete JS SDK directly
- This is a client component exception: the Places widget must run in the browser
- On place selection, extract `formatted_address`, `city` (locality), `lat`, `lng`
- Map extracted values into the venue form fields via react-hook-form `setValue`
- Add `latitude` and `longitude` nullable float columns to the `venues` table for future map use
- Env var: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (client-side, restricted by HTTP referrer)
- Debounce input to limit API calls
- Fallback: if the API key is missing, the address field works as a plain text input
