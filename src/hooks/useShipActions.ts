import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface ShipActionRecord {
  id: string
  user_id: string
  action_id: string
  activated_at: string
}

async function fetchShipActions(userId: string): Promise<ShipActionRecord[]> {
  const { data, error } = await supabase
    .from('ship_actions')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data ?? []
}

export function useShipActions(userId: string) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['shipActions', userId],
    queryFn: () => fetchShipActions(userId),
    enabled: !!userId,
  })

  // Upsert on activation — refreshes activated_at without creating duplicates.
  const activateAction = useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from('ship_actions')
        .upsert(
          { user_id: userId, action_id: actionId, activated_at: new Date().toISOString() },
          { onConflict: 'user_id,action_id' }
        )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipActions', userId] }),
  })

  return { ...query, activateAction }
}
