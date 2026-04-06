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
      await economy.awardGold(calculateTodoGold(todo.difficulty))
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

  function isOverdue(todo: Todo): boolean {
    if (todo.completed || !todo.due_date) return false
    return todo.due_date < today
  }

  return { ...query, completeTodo, addTodo, deleteTodo, markOverdueChecked, isOverdue }
}
