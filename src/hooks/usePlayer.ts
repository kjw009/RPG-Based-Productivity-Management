import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getRankTitle } from '../lib/gameRules'
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

// Separate mutation hook for player updates, so we can keep the main usePlayer hook focused on data fetching and caching. This also lets us reuse the update logic
// inside other hooks (useGameEconomy) without needing to call usePlayer inside them.
export function useUpdatePlayer(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates: Partial<Player>) => {
      // Auto-update rank_title when xp changes
      if (updates.xp !== undefined) {
        updates.rank_title = getRankTitle(updates.xp)
      }
      // Only update the fields that were actually changed, to avoid overwriting concurrent updates from other hooks.
      const { error } = await supabase
        .from('player')
        .update(updates)
        .eq('user_id', userId)
      if (error) throw error
    },
    // Invalidate the player query to refresh data after an update.
    onSuccess: () => qc.invalidateQueries({ queryKey: ['player', userId] }),
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
