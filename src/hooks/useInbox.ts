/**
 * React Query hook to fetch and mutate the user inbox.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { InboxItem } from '../types'

async function fetchInbox(userId: string): Promise<
  // Load inbox items for the current user from Supabase in chronological order.InboxItem[]> {
  const { data, error } = await supabase
    .from('inbox_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useInbox(userId: string) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['inbox', userId],
    queryFn: () => fetchInbox(userId),
    enabled: !!userId,
  })

  const addItem = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from('inbox_items')
        .insert({ user_id: userId, content: content.trim(), source: 'manual' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inbox', userId] }),
  })

  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from('inbox_items').delete().eq('id', itemId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inbox', userId] }),
  })

  return { ...query, addItem, deleteItem }
}
