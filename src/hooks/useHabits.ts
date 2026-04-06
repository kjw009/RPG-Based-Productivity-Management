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

  function consistencyPct(habitId: string): number {
    const count = (logsQuery.data ?? []).filter((l) => l.habit_id === habitId).length
    return Math.min(Math.round((count / 30) * 100), 100)
  }

  const logHabit = useMutation({
    // direction: which side to log — for 'both' habits the caller specifies; for 'good'/'bad' it matches the type
    mutationFn: async ({ habit, direction }: { habit: Habit; direction: 'good' | 'bad' }) => {
      const { error: logError } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habit.id, user_id: userId })
      if (logError) throw logError

      const { error: countError } = await supabase
        .from('habits')
        .update({ total_count: habit.total_count + 1 })
        .eq('id', habit.id)
      if (countError) throw countError

      if (direction === 'good') {
        await economy.awardGold(calculateHabitGold(habit.difficulty))
      } else {
        if (economy.hasActiveEffect('smoke_bomb')) {
          await economy.consumeEffect('smoke_bomb')
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
    mutationFn: async (payload: {
      title: string
      type: 'good' | 'bad' | 'both'
      difficulty: number
      areas: string[]
    }) => {
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

  const updateHabit = useMutation({
    mutationFn: async (payload: {
      id: string
      title: string
      type: 'good' | 'bad' | 'both'
      difficulty: number
      areas: string[]
    }) => {
      const { id, ...updates } = payload
      const { error } = await supabase.from('habits').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', userId] }),
  })

  return { habitsQuery, logsQuery, consistencyPct, logHabit, addHabit, deleteHabit, updateHabit }
}
