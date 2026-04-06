import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Area } from '../types'

async function fetchAreas(userId: string): Promise<Area[]> {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useAreas(userId: string) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['areas', userId],
    queryFn: () => fetchAreas(userId),
    enabled: !!userId,
  })

  const addArea = useMutation({
    mutationFn: async (payload: { name: string; color: string }) => {
      const { error } = await supabase
        .from('areas')
        .insert({ user_id: userId, ...payload })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['areas', userId] }),
  })

  const deleteArea = useMutation({
    mutationFn: async (areaId: string) => {
      const { error } = await supabase.from('areas').delete().eq('id', areaId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['areas', userId] }),
  })

  // Helper: look up color for a given area name
  function colorFor(name: string): string {
    return query.data?.find((a) => a.name === name)?.color ?? '#6b7280'
  }

  return { ...query, addArea, deleteArea, colorFor }
}
