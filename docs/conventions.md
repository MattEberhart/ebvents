# Conventions

## Install commands

```bash
npx create-next-app@latest ebvents --typescript --tailwind --app --eslint --src-dir=false --import-alias="@/*"
cd ebvents
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form @hookform/resolvers zod
npm install sonner
npx shadcn@latest init
npx shadcn@latest add button input label select textarea card alert-dialog separator command badge skeleton table popover dialog form
```

## Hard rules

- **No Supabase client in client components.** All DB access via Server Actions or Server Components only.
- **No useEffect + fetch for data.** Server Components for initial load, Server Actions for mutations.
- **Every form uses shadcn Field components (`<Field>`, `<FieldLabel>`, `<FieldError>`) with react-hook-form `Controller` + zod.** No raw `register()` or manual error `<p>` tags.
- **Every Server Action uses `safeAction`.** Always returns `{ data, error }`.
- **Search and filter always re-fetch from the DB** via URL params > Server Component. Never filter client-side.
- **Never delete without an `<AlertDialog>` confirmation.**
- **Prefer Server Actions over Route Handlers.** The only Route Handler is `/auth/callback`.
- **Every page group has an error.tsx** for error boundaries.
- **Do not edit README.md with AI.** The README is hand-written by Matt and must stay that way per the challenge requirements.

## Patterns

**Calling actions from client components:**
```typescript
const [isPending, startTransition] = useTransition()

startTransition(async () => {
  const { data, error } = await someAction(values)
  if (error) { toast.error(error); return }
  toast.success('Done')
  router.push('/')
})
```

**Search via URL params** — push params with `useRouter`, the Server Component re-renders with new data:
```typescript
const params = new URLSearchParams(searchParams.toString())
params.set('q', value)
router.push(`/?${params.toString()}`)
```

**ViewToggle URL param** — `?view=grid|list` controls dashboard display mode:
```typescript
params.set('view', 'list')
router.push(`/?${params.toString()}`)
```

**Toast on every mutation:**
```typescript
toast.success('Event created')
toast.error(result.error ?? 'Something went wrong')
```

**Middleware** — `middleware.ts` at root delegates to `lib/supabase/middleware.ts`:
- Refreshes Supabase session on every request
- Unauthenticated > `/login`, authenticated away from auth pages > `/`

## UI notes

- Dashboard: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` card layout + data table toggle
- Sport badge colors (all 17): Soccer=blue, Basketball=orange, Football=amber, Baseball=red, Hockey=cyan, Tennis=green, Golf=emerald, MMA=rose, Boxing=pink, Cricket=lime, Rugby=yellow, Volleyball=indigo, Swimming=sky, Track&Field=teal, Formula1=violet, Esports=purple, Other=gray
- Font: Geist Sans + Geist Mono (Next.js default, distinctive non-Inter choice)
- Loading skeletons via `app/(dashboard)/loading.tsx` using shadcn `<Skeleton>`
- Edit/Delete buttons on each card; Delete opens AlertDialog before acting
- Live event indicator: pulsing green dot + "Live" label
- Past events: reduced opacity
- Cancelled events: destructive badge + reduced opacity
