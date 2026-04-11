// ============================================================
// Game Rules — pure functions, no side effects
// All gold/HP formulas live here so they're easy to tweak
// without hunting through component or hook files.
// ============================================================

// Rank thresholds based on XP (future feature)
export const RANK_THRESHOLDS = [
  { min: 0,        max: 1599,     title: 'Cadet',              hp: 1,   gold: 1,   dailyCompletionThresh: 0.2,  grace: 3, idle: 1 },
  { min: 1600,     max: 7099,     title: 'Space Cadet',        hp: 1.2, gold: 1.2, dailyCompletionThresh: 0.25, grace: 3, idle: 1.2 },
  { min: 7100,     max: 14399,    title: 'Sergeant',           hp: 1.4, gold: 1.4, dailyCompletionThresh: 0.3,  grace: 2, idle: 1.4 },
  { min: 14400,    max: 23899,    title: 'Master Sergeant',    hp: 1.6, gold: 1.6, dailyCompletionThresh: 0.35, grace: 2, idle: 1.6 },
  { min: 23900,    max: 35899,    title: 'Chief',              hp: 1.8, gold: 1.8, dailyCompletionThresh: 0.4,  grace: 2, idle: 1.8 },
  { min: 35900,    max: 50399,    title: 'Space Chief Prime',  hp: 2,   gold: 2,   dailyCompletionThresh: 0.45, grace: 2, idle: 2 },
  { min: 50400,    max: 67399,    title: 'Death Captain',      hp: 2.2, gold: 2.2, dailyCompletionThresh: 0.5,  grace: 1, idle: 2.2 },
  { min: 67400,    max: 86899,    title: 'Marshal',            hp: 2.4, gold: 2.4, dailyCompletionThresh: 0.55, grace: 1, idle: 2.4 },
  { min: 86900,    max: 108899,   title: 'Star Marshal',       hp: 2.6, gold: 2.6, dailyCompletionThresh: 0.6,  grace: 1, idle: 2.6 },
  { min: 108900,   max: 133399,   title: 'Admiral',            hp: 2.8, gold: 2.8, dailyCompletionThresh: 0.65, grace: 1, idle: 2.8 },
  { min: 133400,   max: 190999,   title: 'Skull Admiral',      hp: 3,   gold: 3,   dailyCompletionThresh: 0.7,  grace: 1, idle: 3 },
  { min: 191000,   max: 258499,   title: 'Fleet Admiral',      hp: 3.2, gold: 3.2, dailyCompletionThresh: 0.75, grace: 1, idle: 3.2 },
  { min: 258500,   max: 335999,   title: 'Admirable Admiral',  hp: 3.4, gold: 3.4, dailyCompletionThresh: 0.8,  grace: 0, idle: 3.4 },
  { min: 336000,   max: 423499,   title: 'Commander',          hp: 3.6, gold: 3.6, dailyCompletionThresh: 0.82, grace: 0, idle: 3.6 },
  { min: 423500,   max: 520999,   title: 'Galactic Commander', hp: 3.8, gold: 3.8, dailyCompletionThresh: 0.84, grace: 0, idle: 3.8 },
  { min: 521000,   max: 630999,   title: 'Hell Commander',     hp: 4,   gold: 4,   dailyCompletionThresh: 0.86, grace: 0, idle: 4 },
  { min: 631000,   max: 750499,   title: 'General',            hp: 4.2, gold: 4.2, dailyCompletionThresh: 0.88, grace: 0, idle: 4.2 },
  { min: 750500,   max: 879999,   title: '5-Star General',     hp: 4.4, gold: 4.4, dailyCompletionThresh: 0.9,  grace: 0, idle: 4.4 },
  { min: 880000,   max: 1019499,  title: '10-Star General',    hp: 4.6, gold: 4.6, dailyCompletionThresh: 0.92, grace: 0, idle: 4.6 },
  { min: 1019500,  max: 1167999,  title: 'Private',            hp: 4.8, gold: 4.8, dailyCompletionThresh: 0.94, grace: 0, idle: 4.8 },
  { min: 1168000,  max: Infinity, title: 'Super Private',      hp: 5,   gold: 5,   dailyCompletionThresh: 0.95, grace: 0, idle: 5 },
] as const

// Get the player's rank based on their current XP total.
export function getRank(currentXP: number) {
  return RANK_THRESHOLDS.find(r => currentXP >= r.min && currentXP <= r.max)
}

// Get the player's rank title based on their current XP total.
export function getRankTitle(currentXP: number): string {
  const rank = getRank(currentXP)
  return rank?.title ?? 'Super Private'
}

// HP penalty multiplier based on current rank. Higher ranks have higher multipliers, making failure more punishing but also more rewarding.
export function getHPPenaltyMultiplier(currentXP: number): number {
  return getRank(currentXP)?.hp ?? 1
}
// Gold multiplier based on current rank. Higher ranks earn more gold, making progression feel more rewarding.
export function getGoldMultiplier(currentXP: number): number {
  return getRank(currentXP)?.gold ?? 1
}

// Daily completion threshold based on current rank. Higher ranks require a higher percentage of dailies completed to avoid HP penalties, encouraging consistent play.
export function getDailyCompletionThreshold(currentXP: number): number {
  return getRank(currentXP)?.dailyCompletionThresh ?? 1
}

// Number of grace days for missed dailies based on current rank. Higher ranks have fewer grace days, making it more important to maintain streaks.
export function getOverdueGraceDays(currentXP: number): number {
  return getRank(currentXP)?.grace ?? 0
}

// Idle HP decay based on current rank. Higher ranks have higher decay, encouraging regular play and making it more costly to neglect the game.
export function getIdleDecayHP(currentXP: number): number {
  return getRank(currentXP)?.idle ?? 1
}

// Returns the amount of gold earned for completing a daily task, based on its difficulty, the player's current XP (rank), and their current streak on that task.
// Streaks increase rewards up to a cap, incentivising consistency without letting rewards spiral out of control.
export function calculateDailyGold(difficulty: number, currentXP: number, streak: number): number {
  const base = difficulty * 3
  const rankMultiplier = getGoldMultiplier(currentXP)
  const multiplier = Math.min(1 + streak / 20, 3)
  return Math.floor(base * multiplier * rankMultiplier)
}

// One-time bonus gold awarded when a streak hits a milestone.
// Only exact milestone values trigger — not every day above 7.
export function getStreakBonus(newStreak: number): number {
  if (newStreak === 100) return 500
  if (newStreak === 30) return 150
  if (newStreak === 7) return 50
  return 0
}

// Todos and habits use flat Threshs (no streak involved).
export function calculateTodoGold(difficulty: number, currentXP: number): number {
  return difficulty * 5 * getGoldMultiplier(currentXP)
}

export function calculateHabitGold(difficulty: number, currentXP: number): number {
  return difficulty * 2 * getGoldMultiplier(currentXP)
}

// HP penalties for missed dailies, bad habits, and overdue todos are all based on difficulty and current rank, but not streak, since they're meant to be consequences for failure rather than rewards for success.
export function calculateMissedDailyHP(difficulty: number, currentXP: number): number {
  return difficulty * 4 * getHPPenaltyMultiplier(currentXP)
}

// Bad habits get a flat HP penalty based on difficulty and rank.
export function calculateBadHabitHP(difficulty: number, currentXP: number): number {
  return difficulty * getHPPenaltyMultiplier(currentXP)
}

// Overdue todos get an HP penalty based on difficulty and rank, to encourage timely completion. They don't get a streak multiplier since they're not meant to reward consistency, but they do get harsher penalties at higher ranks to keep the stakes high.
// Need to implement grace days logic in the future, so the penalty shouldn't kick in immediately on the due date — only after the grace period has passed.
export function calculateOverdueTodoHP(difficulty: number, currentXP: number): number {
  return difficulty * 5 * getHPPenaltyMultiplier(currentXP)
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
