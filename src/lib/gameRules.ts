// ============================================================
// Game Rules — pure functions, no side effects
// All gold/HP formulas live here so they're easy to tweak
// without hunting through component or hook files.
// ============================================================

// Rank thresholds based on lifetime gold (not current gold —
// rank never goes backwards even if you lose gold to a KO).
export const RANK_THRESHOLDS = [
  { min: 0,     max: 500,      title: 'Pickpocket' },
  { min: 501,   max: 1500,     title: 'Cutpurse' },
  { min: 1501,  max: 4000,     title: 'Rogue' },
  { min: 4001,  max: 10000,    title: 'Shadow' },
  { min: 10001, max: 25000,    title: 'Phantom' },
  { min: 25001, max: Infinity, title: 'Shadow Master' },
] as const

export function getRankTitle(lifetimeGold: number): string {
  const rank = RANK_THRESHOLDS.find((r) => lifetimeGold >= r.min && lifetimeGold <= r.max)
  return rank?.title ?? 'Shadow Master'
}

// Daily gold scales with streak: longer streaks = bigger multiplier.
// Formula: base × (1 + streak/20), hard-capped at 3× so it doesn't
// become trivially easy to farm gold.
export function calculateDailyGold(difficulty: number, streak: number): number {
  const base = difficulty * 10
  const multiplier = Math.min(1 + streak / 20, 3)
  return Math.floor(base * multiplier)
}

// One-time bonus gold awarded when a streak hits a milestone.
// Only exact milestone values trigger — not every day above 7.
export function getStreakBonus(newStreak: number): number {
  if (newStreak === 100) return 500
  if (newStreak === 30) return 150
  if (newStreak === 7) return 50
  return 0
}

// Todos and habits use flat rates (no streak involved).
export function calculateTodoGold(difficulty: number): number {
  return difficulty * 10
}

export function calculateHabitGold(difficulty: number): number {
  return difficulty * 5
}

// HP penalties use different multipliers per failure type.
// Missing a daily is penalised less than missing a deadline —
// intentionally — because deadlines are more deliberate commitments.
export function calculateMissedDailyHP(difficulty: number): number {
  return difficulty * 8
}

export function calculateBadHabitHP(difficulty: number): number {
  return difficulty * 6
}

export function calculateOverdueTodoHP(difficulty: number): number {
  return difficulty * 10
}

// Shop / ability constants
export const HEALTH_POTION_RESTORE = 25
export const PICKPOCKET_GOLD_RECOVERY = 30 // gold saved on KO when Pickpocket is armed

// ── Date helpers ──────────────────────────────────────────────────────────────

// Returns today's date as a YYYY-MM-DD string (local time).
// Used for comparing last_completed_date on daily tasks.
export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

// Returns yesterday's date as YYYY-MM-DD.
// Used in the daily reset to check which tasks were missed.
export function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

// 0 = Sunday, 1 = Monday, …, 6 = Saturday.
// Matches the recurrence_days column format (JS getDay() convention).
export function todayWeekday(): number {
  return new Date().getDay()
}

export function yesterdayWeekday(): number {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.getDay()
}

// How many days until the next Monday mana reset.
// Returns 7 if today IS Monday (next reset is next week).
export function daysUntilNextMonday(): number {
  const today = new Date().getDay()
  if (today === 1) return 7
  return today === 0 ? 1 : 8 - today
}

// End-of-day boundary used for Backstab's "once per day" expiry.
export function endOfToday(): Date {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

// End-of-week boundary (Sunday 23:59:59) for Smoke Bomb's weekly limit.
export function endOfWeek(): Date {
  const d = new Date()
  const daysUntilSunday = 7 - d.getDay()
  d.setDate(d.getDate() + (daysUntilSunday === 7 ? 0 : daysUntilSunday))
  d.setHours(23, 59, 59, 999)
  return d
}

// Checks whether an active_effects row is still valid.
// Comparing against current time avoids a round-trip to the DB.
export function isEffectActive(expiresAt: string): boolean {
  return new Date(expiresAt) > new Date()
}
