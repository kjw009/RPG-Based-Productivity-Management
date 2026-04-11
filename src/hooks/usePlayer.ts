import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Player } from '../types'

async function fetchPlayer(userId: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('player')
    .select('*')
    .eq('user_id', userId)
    .single()
  // Supabase returns PGRST116 when no row exists yet; callers treat that as
  // "needs seeding" rather than a hard failure.
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export function usePlayer(userId: string) {
  return useQuery({
    queryKey: ['player', userId],
    queryFn: () => fetchPlayer(userId),
    enabled: !!userId,
  })
}


export function useSeedPlayer(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      // The RPC seeds the player plus any initial game data in one round-trip.
      const { error } = await supabase.rpc('seed_new_user', {
        p_user_id: userId,
        p_name: name,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['player', userId] }),
  })
}
