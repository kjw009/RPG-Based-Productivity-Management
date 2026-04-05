import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  getRankTitle,
  PICKPOCKET_GOLD_RECOVERY,
  isEffectActive,
} from '../lib/gameRules'
import { useGameContext } from '../context/GameContext'
import type { Player, ActiveEffect } from '../types'

/**
 * Central hook for all gold/HP/mana transactions.
 * Reads current player + effects from React Query cache.
 */
export function useGameEconomy(userId: string) {
  const qc = useQueryClient()
  const { triggerKO } = useGameContext()

  function getPlayer(): Player | null {
    return qc.getQueryData<Player | null>(['player', userId]) ?? null
  }

  function getActiveEffects(): ActiveEffect[] {
    return qc.getQueryData<ActiveEffect[]>(['activeEffects', userId]) ?? []
  }

  function hasActiveEffect(type: string): boolean {
    const effects = getActiveEffects()
    return effects.some((e) => e.effect_type === type && isEffectActive(e.expires_at))
  }

  async function consumeEffect(type: string) {
    const effects = getActiveEffects()
    const effect = effects.find((e) => e.effect_type === type && isEffectActive(e.expires_at))
    if (!effect) return
    await supabase.from('active_effects').delete().eq('id', effect.id)
    qc.invalidateQueries({ queryKey: ['activeEffects', userId] })
  }

  /** Award gold to player. Returns actual gold awarded (after multipliers). */
  async function awardGold(baseAmount: number): Promise<number> {
    const player = getPlayer()
    if (!player) return 0

    let amount = baseAmount

    // Double Gold Scroll multiplier
    if (hasActiveEffect('double_gold')) {
      amount *= 2
    }

    const newGold = player.gold + amount
    const newLifetime = player.lifetime_gold + amount

    const { error } = await supabase
      .from('player')
      .update({
        gold: newGold,
        lifetime_gold: newLifetime,
        rank_title: getRankTitle(newLifetime),
      })
      .eq('user_id', userId)

    if (error) throw error
    qc.invalidateQueries({ queryKey: ['player', userId] })
    return amount
  }

  /** Deduct HP. Triggers KO flow if HP reaches 0. */
  async function deductHP(amount: number) {
    const player = getPlayer()
    if (!player) return

    const newHP = player.hp - amount

    if (newHP <= 0) {
      await handleKO()
    } else {
      const { error } = await supabase
        .from('player')
        .update({ hp: newHP })
        .eq('user_id', userId)
      if (error) throw error
      qc.invalidateQueries({ queryKey: ['player', userId] })
    }
  }

  /** Full KO sequence: Pickpocket check → zero gold → reset HP → show overlay */
  async function handleKO() {
    const player = getPlayer()
    if (!player) return

    let goldToKeep = 0

    // Pickpocket: recover 30 gold before zeroing
    if (hasActiveEffect('pickpocket')) {
      goldToKeep = PICKPOCKET_GOLD_RECOVERY
      await consumeEffect('pickpocket')
    }

    const { error } = await supabase
      .from('player')
      .update({ hp: player.max_hp, gold: goldToKeep })
      .eq('user_id', userId)

    if (error) throw error
    qc.invalidateQueries({ queryKey: ['player', userId] })

    triggerKO()
  }

  /** Deduct mana for ability use. */
  async function deductMana(amount: number) {
    const player = getPlayer()
    if (!player) return
    const newMana = Math.max(0, player.mana - amount)
    const { error } = await supabase
      .from('player')
      .update({ mana: newMana })
      .eq('user_id', userId)
    if (error) throw error
    qc.invalidateQueries({ queryKey: ['player', userId] })
  }

  /** Restore HP (health potion etc). Cannot exceed max_hp. */
  async function restoreHP(amount: number) {
    const player = getPlayer()
    if (!player) return
    const newHP = Math.min(player.hp + amount, player.max_hp)
    const { error } = await supabase
      .from('player')
      .update({ hp: newHP })
      .eq('user_id', userId)
    if (error) throw error
    qc.invalidateQueries({ queryKey: ['player', userId] })
  }

  return {
    hasActiveEffect,
    consumeEffect,
    awardGold,
    deductHP,
    handleKO,
    deductMana,
    restoreHP,
  }
}
