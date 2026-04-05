import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { calculateBadHabitHP, calculateHabitGold } from '../lib/gameRules'
import { useGameEconomy } from './useGameEconomy'
import type { Habit, HabitLog } from '../types'

async function fetchHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

async function fetchHabitLogs(userId: string): Promise<HabitLog[]> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export function useHabits(userId: string) {
  const qc = useQueryClient()
  const economy = useGameEconomy(userId)

  const habitsQuery = useQuery({
    queryKey: ['habits', userId],
    queryFn: () => fetchHabits(userId),
    enabled: !!userId,
  })

  const logsQuery = useQuery({
    queryKey: ['habitLogs', userId],
    queryFn: () => fetchHabitLogs(userId),
    enabled: !!userId,
  })

  // 30-day consistency % per habit
  function consistencyPct(habitId: string): number {
    const logs = logsQuery.data ?? []
    const count = logs.filter((l) => l.habit_id === habitId).length
    return Math.min(Math.round((count / 30) * 100), 100)
  }

  const logHabit = useMutation({
    mutationFn: async (habit: Habit) => {
      // Insert log
      const { error: logError } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habit.id, user_id: userId })
      if (logError) throw logError

      // Increment total_count
      const { error: countError } = await supabase
        .from('habits')
        .update({ total_count: habit.total_count + 1 })
        .eq('id', habit.id)
      if (countError) throw countError

      if (habit.type === 'good') {
        await economy.awardGold(calculateHabitGold(habit.difficulty))
      } else {
        // Bad habit — check Smoke Bomb
        if (economy.hasActiveEffect('smoke_bomb')) {
          await economy.consumeEffect('smoke_bomb')
          // No HP deduction
        } else {
          await economy.deductHP(calculateBadHabitHP(habit.difficulty))
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits', userId] })
      qc.invalidateQueries({ queryKey: ['habitLogs', userId] })
    },
  })

  const addHabit = useMutation({
    mutationFn: async (payload: { title: string; type: 'good' | 'bad'; difficulty: number }) => {
      const { error } = await supabase.from('habits').insert({ user_id: userId, ...payload })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', userId] }),
  })

  const deleteHabit = useMutation({
    mutationFn: async (habitId: string) => {
      const { error } = await supabase.from('habits').delete().eq('id', habitId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', userId] }),
  })

  return { habitsQuery, logsQuery, consistencyPct, logHabit, addHabit, deleteHabit }
}
