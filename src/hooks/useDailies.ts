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

  // Only tasks scheduled for today
  const todaysTasks = (query.data ?? []).filter((t) =>
    t.recurrence_days.includes(todayDow)
  )

  const completeTask = useMutation({
    mutationFn: async (task: DailyTask) => {
      if (task.last_completed_date === today) return // already done

      const newStreak = task.streak + 1

      // Base gold with streak multiplier
      let gold = calculateDailyGold(task.difficulty, task.streak)

      // Backstab: triple gold if on streak and effect active
      if (task.streak > 0 && economy.hasActiveEffect('backstab')) {
        gold *= 3
        await economy.consumeEffect('backstab')
      }

      // Award gold (Double Gold Scroll check is inside awardGold)
      await economy.awardGold(gold)

      // Streak milestone bonus
      const bonus = getStreakBonus(newStreak)
      if (bonus > 0) await economy.awardGold(bonus)

      // Update task
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
