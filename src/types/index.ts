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

export interface DailyTask {
  id: string
  user_id: string
  title: string
  recurrence_days: number[]
  difficulty: number
  streak: number
  last_completed_date: string | null
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  title: string
  type: 'good' | 'bad'
  difficulty: number
  total_count: number
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
  created_at: string
}

export interface Todo {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string
  area: string[]
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

export type PARA = 'Projects' | 'Areas' | 'Resources' | 'Archives'
export const PARA_OPTIONS: PARA[] = ['Projects', 'Areas', 'Resources', 'Archives']

export type EffectType =
  | 'health_potion'
  | 'double_gold'
  | 'pickpocket'
  | 'shadow_step'
  | 'smoke_bomb'
  | 'backstab'
  | 'custom'
