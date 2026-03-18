# Pagination

## What it does
The event list on the dashboard is paginated instead of loading all events at once. Supports either traditional page-based pagination or infinite scroll.

## Why it's valuable
Essential for performance as the event count grows. Prevents slow page loads and excessive memory usage from rendering hundreds of cards.

## Implementation notes
- Add `page` and `limit` (default 12) URL search params
- Update `getEvents` Server Action to accept `page`/`limit`, apply `.range(from, to)` on the Supabase query
- Return total count via Supabase `.select('*', { count: 'exact' })` for page count calculation
- Add a `Pagination` component (prev/next buttons + page numbers) below the event grid
- Alternative: infinite scroll using `IntersectionObserver` in a client component that appends pages
- Keep search and sport filter params in the URL alongside pagination params
- Reset to page 1 when search/filter changes
- Use shadcn `Skeleton` cards as loading placeholders while the next page loads
