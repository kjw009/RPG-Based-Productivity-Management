/**
 * React Query hook to fetch projects and derive project progress metrics.
 */
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

  function projectProgress(projectId: string): { completed: number; total: number; pct: number } {
  // Compute the completion percentage for a project using cached todo data.
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
    mutationFn: async (payload: {
      title: string
      description: string
      areas: string[]
    }) => {
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

  const updateProject = useMutation({
    mutationFn: async (payload: {
      id: string
      title: string
      description: string
      areas: string[]
    }) => {
      const { id, ...updates } = payload
      const { error } = await supabase.from('projects').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', userId] }),
  })

  return { ...query, projectProgress, addProject, deleteProject, updateProject }
}
