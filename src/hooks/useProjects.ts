import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Project, Todo } from '../types'

async function fetchProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useProjects(userId: string) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => fetchProjects(userId),
    enabled: !!userId,
  })

  // Progress: get % complete from todos cache
  function projectProgress(projectId: string): { completed: number; total: number; pct: number } {
    const todos = qc.getQueryData<Todo[]>(['todos', userId]) ?? []
    const mine = todos.filter((t) => t.project_id === projectId)
    const done = mine.filter((t) => t.completed).length
    return {
      completed: done,
      total: mine.length,
      pct: mine.length === 0 ? 0 : Math.round((done / mine.length) * 100),
    }
  }

  const addProject = useMutation({
    mutationFn: async (payload: { title: string; description: string }) => {
      const { error } = await supabase.from('projects').insert({ user_id: userId, ...payload })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', userId] }),
  })

  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', projectId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', userId] })
      qc.invalidateQueries({ queryKey: ['todos', userId] })
    },
  })

  return { ...query, projectProgress, addProject, deleteProject }
}
