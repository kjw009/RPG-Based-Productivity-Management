import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  calculateDailyGold,
  getStreakBonus,
  todayStr,
  todayWeekday,
} from '../lib/gameRules'
import { useGameEconomy } from './useGameEconomy'
import type { DailyTask } from '../types'

async function fetchDailies(userId: string): Promise<DailyTask[]> {
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useDailies(userId: string) {
  const qc = useQueryClient()
  const economy = useGameEconomy(userId)
  const today = todayStr()
  const todayDow = todayWeekday()

  const query = useQuery({
    queryKey: ['dailies', userId],
    queryFn: () => fetchDailies(userId),
    enabled: !!userId,
  })

  // Filter to only tasks whose recurrence_days includes today's weekday.
  // 0 = Sunday … 6 = Saturday, matching JS Date.getDay() convention.
  const todaysTasks = (query.data ?? []).filter((t) =>
    t.recurrence_days.includes(todayDow)
  )

  const completeTask = useMutation({
    mutationFn: async (task: DailyTask) => {
      // Guard: already completed today
      if (task.last_completed_date === today) return

      const newStreak = task.streak + 1

      // Gold = base rate × streak multiplier (see gameRules.calculateDailyGold)
      let gold = calculateDailyGold(task.difficulty, task.streak)

      // Backstab triples gold for the next streak completion, then auto-expires.
      // It only applies when the player is already on a streak (streak > 0).
      if (task.streak > 0 && economy.hasActiveEffect('backstab')) {
        gold *= 3
        await economy.consumeEffect('backstab')
      }

      // awardGold handles the Double Gold Scroll multiplier internally
      await economy.awardGold(gold)

      // Milestone bonuses (7 / 30 / 100-day streaks)
      const bonus = getStreakBonus(newStreak)
      if (bonus > 0) await economy.awardGold(bonus)

      const { error } = await supabase
        .from('daily_tasks')
        .update({ last_completed_date: today, streak: newStreak })
        .eq('id', task.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dailies', userId] }),
  })

  const addTask = useMutation({
    mutationFn: async (payload: {
      title: string
      recurrence_days: number[]
      difficulty: number
    }) => {
      const { error } = await supabase
        .from('daily_tasks')
        .insert({ user_id: userId, ...payload })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dailies', userId] }),
  })

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from('daily_tasks').delete().eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dailies', userId] }),
  })

  return { ...query, todaysTasks, completeTask, addTask, deleteTask }
}
