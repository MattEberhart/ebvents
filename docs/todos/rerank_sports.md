# Rerank Sport Types

## What it does
Re-order the `display_order` values in the `sport_types` table so the dropdown and filter lists reflect actual popularity or user preference rather than the arbitrary initial ordering.

## Why it's valuable
The current `display_order` was set during the initial seed and doesn't reflect real-world usage patterns. Reranking ensures the most commonly used sport types appear first in dropdowns, reducing friction during event creation.

## Implementation notes
- Audit current event counts per sport type to determine a data-driven ordering
- Write a migration to update `display_order` values based on the new ranking
- Consider adding an admin UI or drag-and-drop reorder interface in the future
- The `getSportTypes()` action already orders by `display_order`, so no action-layer changes are needed — only the data values need updating
- Keep "Other" pinned at `display_order = 99` as a catch-all
