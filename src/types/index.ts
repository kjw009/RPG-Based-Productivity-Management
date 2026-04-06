export interface Player {
  id: string
  user_id: string
  name: string
  rank_title: string
  lifetime_gold: number
  hp: number
  max_hp: number
  mana: number
  max_mana: number
  gold: number
  created_at: string
}

// User-defined area tag (e.g. "Learning", "Health", "Work")
export interface Area {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface DailyTask {
  id: string
  user_id: string
  title: string
  recurrence_days: number[]
  difficulty: number
  streak: number
  last_completed_date: string | null
  areas: string[]
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  title: string
  type: 'good' | 'bad' | 'both'
  difficulty: number
  total_count: number
  areas: string[]
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  logged_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string
  areas: string[]
  created_at: string
}

export interface Todo {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string
  areas: string[]
  difficulty: number
  due_date: string | null
  completed: boolean
  completed_at: string | null
  overdue_checked: boolean
  shadow_stepped: boolean
  created_at: string
}

export interface ShopItem {
  id: string
  user_id: string
  name: string
  description: string
  cost: number
  type: 'consumable' | 'custom_reward'
  quantity: number
  effect_type: string
  created_at: string
}

export interface Ability {
  id: string
  user_id: string
  name: string
  description: string
  effect_type: string
  mana_cost: number
  uses_remaining: number
  created_at: string
}

export interface ActiveEffect {
  id: string
  user_id: string
  effect_type: string
  activated_at: string
  expires_at: string
  metadata?: Record<string, unknown> | null
}

export type EffectType =
  | 'health_potion'
  | 'double_gold'
  | 'pickpocket'
  | 'shadow_step'
  | 'smoke_bomb'
  | 'backstab'
  | 'custom'

// Preset colors for new area tags
export const AREA_COLOR_PRESETS = [
  '#6366f1', // indigo
  '#2563eb', // blue
  '#0891b2', // cyan
  '#16a34a', // green
  '#d97706', // amber
  '#dc2626', // red
  '#7e22ce', // purple
  '#db2777', // pink
  '#6b7280', // grey
]
