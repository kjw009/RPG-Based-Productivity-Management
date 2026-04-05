// ============================================================
// Game Rules — pure functions, no side effects
// ============================================================

// Rank thresholds based on lifetime gold
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

// Gold calculations
export function calculateDailyGold(difficulty: number, streak: number): number {
  const base = difficulty * 10
  const multiplier = Math.min(1 + streak / 20, 3)
  return Math.floor(base * multiplier)
}

export function getStreakBonus(newStreak: number): number {
  if (newStreak === 100) return 500
  if (newStreak === 30) return 150
  if (newStreak === 7) return 50
  return 0
}

export function calculateTodoGold(difficulty: number): number {
  return difficulty * 10
}

export function calculateHabitGold(difficulty: number): number {
  return difficulty * 5
}

// HP loss calculations
export function calculateMissedDailyHP(difficulty: number): number {
  return difficulty * 8
}

export function calculateBadHabitHP(difficulty: number): number {
  return difficulty * 6
}

export function calculateOverdueTodoHP(difficulty: number): number {
  return difficulty * 10
}

// Constants
export const HEALTH_POTION_RESTORE = 25
export const PICKPOCKET_GOLD_RECOVERY = 30

// Date helpers
export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export function todayWeekday(): number {
  return new Date().getDay() // 0=Sun, 1=Mon, ..., 6=Sat
}

export function yesterdayWeekday(): number {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.getDay()
}

// Days until next Monday
export function daysUntilNextMonday(): number {
  const today = new Date().getDay() // 0=Sun, 1=Mon, ...
  if (today === 1) return 7 // It's Monday, next reset is in 7 days
  const daysUntil = today === 0 ? 1 : 8 - today
  return daysUntil
}

// End of today (for Backstab — once per day)
export function endOfToday(): Date {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

// End of current week (Sunday 23:59:59)
export function endOfWeek(): Date {
  const d = new Date()
  const daysUntilSunday = 7 - d.getDay()
  d.setDate(d.getDate() + (daysUntilSunday === 7 ? 0 : daysUntilSunday))
  d.setHours(23, 59, 59, 999)
  return d
}

// Check if an active effect is still valid
export function isEffectActive(expiresAt: string): boolean {
  return new Date(expiresAt) > new Date()
}
