import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { calculateTodoGold, todayStr, calcDoomScore } from '../lib/gameRules'
import { useGameEconomy } from './useGameEconomy'
import type { Player, Todo } from '../types'

async function fetchTodos(userId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data ?? []
}

export function useTodos(userId: string) {
  const qc = useQueryClient()
  const player = qc.getQueryData<Player | null>(['player', userId])
  const economy = useGameEconomy(userId)

  const query = useQuery({
    queryKey: ['todos', userId],
    queryFn: () => fetchTodos(userId),
    enabled: !!userId,
  })

  const completeTodo = useMutation({
    mutationFn: async (todo: Todo) => {
      if (todo.completed) return
      await economy.awardGold(calculateTodoGold(todo.difficulty, player?.xp ?? 0))
      const { error } = await supabase
        .from('todos')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('id', todo.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos', userId] }),
  })

  const addTodo = useMutation({
    mutationFn: async (payload: {
      title: string
      description: string
      project_id: string | null
      areas: string[]
      difficulty: number
      due_date: string | null
    }) => {
      const { error } = await supabase.from('todos').insert({ user_id: userId, ...payload })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos', userId] }),
  })

  const deleteTodo = useMutation({
    mutationFn: async (todoId: string) => {
      const { error } = await supabase.from('todos').delete().eq('id', todoId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos', userId] }),
  })

  const updateTodo = useMutation({
    mutationFn: async (payload: {
      id: string
      title: string
      description: string
      project_id: string | null
      areas: string[]
      difficulty: number
      due_date: string | null
    }) => {
      const { id, ...updates } = payload
      const { error } = await supabase.from('todos').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos', userId] }),
  })

  const markOverdueChecked = useMutation({
    mutationFn: async (todoId: string) => {
      const { error } = await supabase
        .from('todos')
        .update({ overdue_checked: true })
        .eq('id', todoId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos', userId] }),
  })

  const today = todayStr()

  // Sort active todos by doom score desc (most urgent first),
  // break ties by difficulty desc (hardest first).
  // Completed todos are appended after, preserving their relative order.
  const raw = query.data ?? []
  const active = raw
    .filter((t) => !t.completed)
    .slice()
    .sort((a, b) => {
      const diff = calcDoomScore(b.due_date, today) - calcDoomScore(a.due_date, today)
      return diff !== 0 ? diff : b.difficulty - a.difficulty
    })
  const completed = raw.filter((t) => t.completed)
  const sortedData: Todo[] = [...active, ...completed]

  function isOverdue(todo: Todo): boolean {
    if (todo.completed || !todo.due_date) return false
    return todo.due_date < today
  }

  return { ...query, data: sortedData, completeTodo, addTodo, deleteTodo, updateTodo, markOverdueChecked, isOverdue }
}
