import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  calculateDailyGold,
  getStreakBonus,
  todayStr,
  todayWeekday,
} from '../lib/gameRules'
import { useGameEconomy } from './useGameEconomy'
import type { DailyTask, Player } from '../types'

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
  // Read player from the React Query cache — same key used by usePlayer hook.
  const player = qc.getQueryData<Player | null>(['player', userId])
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
      if (task.last_completed_date === today) return

      const newStreak = task.streak + 1
      let goldEarned = calculateDailyGold(task.difficulty, player?.xp ?? 0, task.streak)
      let xpEarned = Math.floor(goldEarned * 1.5) // simple XP formula: 10 gold = 1 XP

      // Backstab triples gold for the next streak completion, then auto-expires
      if (task.streak > 0 && economy.hasActiveEffect('backstab')) {
        goldEarned *= 3
        await economy.consumeEffect('backstab')
      }

      await economy.awardGold(goldEarned)
      await economy.awardXP(xpEarned)
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
      areas: string[]
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

  const updateTask = useMutation({
    mutationFn: async (payload: {
      id: string
      title: string
      recurrence_days: number[]
      difficulty: number
      areas: string[]
    }) => {
      const { id, ...updates } = payload
      const { error } = await supabase.from('daily_tasks').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dailies', userId] }),
  })

  return { ...query, todaysTasks, completeTask, addTask, deleteTask, updateTask }
}
