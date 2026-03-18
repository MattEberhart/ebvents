import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// safeAction wrapper — every Server Action uses this
export type ActionResult<T = void> =
  | { data: T; error: null }
  | { data: null; error: string }

export async function safeAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { data: await fn(), error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    console.error('[safeAction]', message)
    return { data: null, error: message }
  }
}

// Sport badge color mapping
export const SPORT_COLORS: Record<string, string> = {
  Soccer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Basketball: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Football: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  Baseball: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Hockey: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  Tennis: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Golf: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  MMA: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  Boxing: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  Cricket: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  Rugby: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Volleyball: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  Swimming: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  'Track & Field': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  'Formula 1': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  Esports: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
}

export function sportColor(name: string): string {
  return SPORT_COLORS[name] ?? SPORT_COLORS.Other
}

export function formatEventDate(startsAt: string): string {
  return new Date(startsAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatEventTime(startsAt: string): string {
  return new Date(startsAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function isEventPast(startsAt: string, durationMinutes: number): boolean {
  const end = new Date(startsAt)
  end.setMinutes(end.getMinutes() + durationMinutes)
  return end < new Date()
}

export function isEventLive(startsAt: string, durationMinutes: number): boolean {
  const start = new Date(startsAt)
  const end = new Date(startsAt)
  end.setMinutes(end.getMinutes() + durationMinutes)
  const now = new Date()
  return now >= start && now < end
}
