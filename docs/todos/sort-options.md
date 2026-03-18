# Sort Options

## What it does
Users can sort the event list by date (upcoming first or latest first), name (A-Z / Z-A), or recently created.

## Why it's valuable
Gives users control over how they browse events. "Upcoming first" is the most natural default for an events app, while "recently created" helps discover new content.

## Implementation notes
- Add a `sort` URL search param with values: `date_asc`, `date_desc`, `name_asc`, `name_desc`, `created_desc`
- Default sort: `date_asc` (upcoming events first)
- Update `getEvents` to apply `.order(column, { ascending })` based on the sort param
- Add a `SortSelect` client component using shadcn `Select` that pushes the sort param to the URL
- Place the sort control next to the existing search/filter bar
- Combine with pagination: sorting applies before pagination range
- Validate the sort param server-side to prevent injection of arbitrary column names
