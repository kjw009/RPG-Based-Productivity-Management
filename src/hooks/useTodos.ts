import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { calculateTodoGold, todayStr } from '../lib/gameRules'
import { useGameEconomy } from './useGameEconomy'
import type { Todo } from '../types'

async function fetchTodos(userId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data ?? []
}

export function useTodos(userId: string) {
  const qc = useQueryClient()
  const economy = useGameEconomy(userId)

  const query = useQuery({
    queryKey: ['todos', userId],
    queryFn: () => fetchTodos(userId),
    enabled: !!userId,
  })

  const completeTodo = useMutation({
    mutationFn: async (todo: Todo) => {
      if (todo.completed) return
      const now = new Date().toISOString()

      await economy.awardGold(calculateTodoGold(todo.difficulty))

      const { error } = await supabase
        .from('todos')
        .update({ completed: true, completed_at: now })
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
      area: string[]
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

  /** Apply shadow step to a todo (extend due date by 3 days) */
  const shadowStepTodo = useMutation({
    mutationFn: async (todo: Todo) => {
      const base = todo.due_date ? new Date(todo.due_date + 'T00:00:00') : new Date()
      base.setDate(base.getDate() + 3)
      const newDate = base.toISOString().split('T')[0]

      const { error } = await supabase
        .from('todos')
        .update({ due_date: newDate, shadow_stepped: true })
        .eq('id', todo.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos', userId] }),
  })

  /** Mark overdue todos as checked (HP already deducted). */
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

  // Helpers
  const today = todayStr()

  function isOverdue(todo: Todo): boolean {
    if (todo.completed || !todo.due_date) return false
    return todo.due_date < today
  }

  return {
    ...query,
    completeTodo,
    addTodo,
    deleteTodo,
    shadowStepTodo,
    markOverdueChecked,
    isOverdue,
  }
}
