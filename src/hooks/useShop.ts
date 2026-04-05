import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { HEALTH_POTION_RESTORE, endOfToday } from '../lib/gameRules'
import { useGameEconomy } from './useGameEconomy'
import type { Player, ShopItem } from '../types'

async function fetchShopItems(userId: string): Promise<ShopItem[]> {
  const { data, error } = await supabase
    .from('shop_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useShop(userId: string) {
  const qc = useQueryClient()
  const economy = useGameEconomy(userId)

  const query = useQuery({
    queryKey: ['shop', userId],
    queryFn: () => fetchShopItems(userId),
    enabled: !!userId,
  })

  function getPlayer(): Player | null {
    return qc.getQueryData<Player | null>(['player', userId]) ?? null
  }

  const buyItem = useMutation({
    mutationFn: async (item: ShopItem) => {
      const player = getPlayer()
      if (!player || player.gold < item.cost) throw new Error('Not enough gold')

      // Deduct gold
      const { error: goldError } = await supabase
        .from('player')
        .update({ gold: player.gold - item.cost })
        .eq('user_id', userId)
      if (goldError) throw goldError

      // Increment quantity
      const { error: itemError } = await supabase
        .from('shop_items')
        .update({ quantity: item.quantity + 1 })
        .eq('id', item.id)
      if (itemError) throw itemError

      qc.invalidateQueries({ queryKey: ['player', userId] })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shop', userId] }),
  })

  const useItem = useMutation({
    mutationFn: async (item: ShopItem) => {
      if (item.quantity < 1) throw new Error('No quantity remaining')

      // Apply effect
      if (item.effect_type === 'health_potion') {
        await economy.restoreHP(HEALTH_POTION_RESTORE)
      } else if (item.effect_type === 'double_gold') {
        const { error } = await supabase.from('active_effects').insert({
          user_id: userId,
          effect_type: 'double_gold',
          expires_at: endOfToday().toISOString(),
        })
        if (error) throw error
        qc.invalidateQueries({ queryKey: ['activeEffects', userId] })
      }

      // Decrement quantity
      const { error } = await supabase
        .from('shop_items')
        .update({ quantity: item.quantity - 1 })
        .eq('id', item.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shop', userId] }),
  })

  const redeemItem = useMutation({
    mutationFn: async (item: ShopItem) => {
      if (item.quantity < 1) throw new Error('No quantity remaining')
      const { error } = await supabase
        .from('shop_items')
        .update({ quantity: item.quantity - 1 })
        .eq('id', item.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shop', userId] }),
  })

  const addReward = useMutation({
    mutationFn: async (payload: {
      name: string
      description: string
      cost: number
    }) => {
      const { error } = await supabase.from('shop_items').insert({
        user_id: userId,
        type: 'custom_reward',
        effect_type: 'custom',
        quantity: 0,
        ...payload,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shop', userId] }),
  })

  return { ...query, buyItem, useItem, redeemItem, addReward }
}
