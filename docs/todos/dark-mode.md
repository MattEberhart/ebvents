# Dark Mode

## What it does
A theme toggle (light / dark / system) that switches the app between light and dark color schemes, respecting the user's OS preference by default.

## Why it's valuable
Improves accessibility and comfort for users in low-light environments. A table-stakes feature for modern web apps.

## Implementation notes
- Install `next-themes` package
- Wrap the app in `<ThemeProvider attribute="class" defaultTheme="system">` in the root layout
- Add `darkMode: 'class'` to `tailwind.config.ts` (if not already set by shadcn init)
- shadcn components already support dark mode via CSS variables -- verify all custom styles use them
- Add a `ThemeToggle` client component with a dropdown (Sun/Moon/Monitor icons) using shadcn `DropdownMenu`
- Place the toggle in the dashboard header nav
- Persist preference in localStorage (handled by next-themes automatically)
- Audit all custom Tailwind classes to add `dark:` variants where needed
