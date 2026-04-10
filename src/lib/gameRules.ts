// ============================================================
// Game Rules — pure functions, no side effects
// All gold/HP formulas live here so they're easy to tweak
// without hunting through component or hook files.
// ============================================================

// Rank thresholds based on XP (future feature)
export const RANK_THRESHOLDS = [
  { min: 0,        max: 1599,     title: 'Cadet' },
  { min: 1600,     max: 7099,     title: 'Space Cadet' },
  { min: 7100,     max: 14399,    title: 'Sergeant' },
  { min: 14400,    max: 23899,    title: 'Master Sergeant' },
  { min: 23900,    max: 35899,    title: 'Chief' },
  { min: 35900,    max: 50399,    title: 'Space Chief Prime' },
  { min: 50400,    max: 67399,    title: 'Death Captain' },
  { min: 67400,    max: 86899,    title: 'Marshal' },
  { min: 86900,    max: 108899,   title: 'Star Marshal' },
  { min: 108900,   max: 133399,   title: 'Admiral' },
  { min: 133400,   max: 190999,   title: 'Skull Admiral' },
  { min: 191000,   max: 258499,   title: 'Fleet Admiral' },
  { min: 258500,   max: 335999,   title: 'Admirable Admiral' },
  { min: 336000,   max: 423499,   title: 'Commander' },
  { min: 423500,   max: 520999,   title: 'Galactic Commander' },
  { min: 521000,   max: 630999,   title: 'Hell Commander' },
  { min: 631000,   max: 750499,   title: 'General' },
  { min: 750500,   max: 879999,   title: '5-Star General' },
  { min: 880000,   max: 1019499,  title: '10-Star General' },
  { min: 1019500,  max: 1167999,  title: 'Private' },
  { min: 1168000,  max: Infinity, title: 'Super Private' },
] as const

export function getRankTitle(currentXP: number): string {
  const rank = RANK_THRESHOLDS.find((r) => currentXP >= r.min && currentXP <= r.max)
  return rank?.title ?? 'Super Private'
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

// ── Quest Doom Score ──────────────────────────────────────────────────────────
// Hidden urgency rating used to sort the quest log. Higher = needs doing sooner.
// Baseline of 10 000 means "due today". Every day further out subtracts 1;
// every day overdue adds 1 (pushing overdue quests above 10 000 so they always
// float to the top). Quests with no due date score 0 and sink to the bottom.
export function calcDoomScore(dueDate: string | null, today: string): number {
  if (!dueDate) return 0
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const daysUntilDue = Math.round((Date.parse(dueDate) - Date.parse(today)) / MS_PER_DAY)
  return 10000 - daysUntilDue
}

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
