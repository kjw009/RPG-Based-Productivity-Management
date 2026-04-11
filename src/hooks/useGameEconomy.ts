import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  getRank,
  getRankTitle,
  PICKPOCKET_GOLD_RECOVERY,
  isEffectActive,
} from '../lib/gameRules'
import { useGameContext } from '../context/GameContext'
import type { Player, ActiveEffect } from '../types'

/**
 * Central hook for all gold/HP/mana transactions.
 *
 * Reads player and active effects directly from the React Query cache
 * (via getQueryData) so it doesn't need its own useQuery call — this
 * avoids creating extra subscriptions and keeps it composable inside
 * other hooks (useDailies, useHabits, etc.).
 *
 * After every DB write it invalidates the relevant query keys so the
 * UI re-renders with fresh data.
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

  /** Returns true if a non-expired effect of the given type exists in cache. */
  function hasActiveEffect(type: string): boolean {
    return getActiveEffects().some(
      (e) => e.effect_type === type && isEffectActive(e.expires_at)
    )
  }

  /** Deletes the first matching active effect from the DB and refreshes cache. */
  async function consumeEffect(type: string) {
    const effect = getActiveEffects().find(
      (e) => e.effect_type === type && isEffectActive(e.expires_at)
    )
    if (!effect) return
    await supabase.from('active_effects').delete().eq('id', effect.id)
    qc.invalidateQueries({ queryKey: ['activeEffects', userId] })
  }

  /**
   * Awards gold to the player.
   * Automatically applies the Double Gold Scroll multiplier (×2) if active.
   * Returns the final amount awarded after multipliers.
   */
  async function awardGold(goldReceived: number): Promise<number> {
    const player = getPlayer()
    if (!player) return 0

    let goldEarned = goldReceived

    // Double Gold Scroll stacks on top of any other multiplier already applied
    if (hasActiveEffect('double_gold')) {
      goldEarned *= 2
    }

    const { error } = await supabase
      .from('player')
      .update({
        gold: player.gold + goldEarned,
      })
      .eq('user_id', userId)

    if (error) throw error
    qc.invalidateQueries({ queryKey: ['player', userId] })
    return goldEarned
  }

  /**
   * Awards XP to the player and updates rank_title if needed.
   * Returns the final amount awarded.
   */
  async function awardXP(xpReceived: number): Promise<number> {
    const player = getPlayer()
    if (!player) return 0

    let xpGained = xpReceived
    
    // Update player attribute: add gold and recalculate rank_title based on new xp total
    const { error } = await supabase
      .from('player')
      .update({
        xp: player.xp + xpGained,
        max_xp: getRank(player.xp + xpGained)?.max ?? player.max_xp, // Update max_xp if rank changes
        rank_title: getRankTitle(player.xp + xpGained), // Update rank_title if rank changes
      })
      .eq('user_id', userId)

    if (error) throw error
    qc.invalidateQueries({ queryKey: ['player', userId] })
    return xpGained
  }

  /**
   * Deducts HP from the player.
   * If the result would be ≤ 0, triggers the full KO sequence instead
   * of setting HP to a negative number.
   */
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

  /**
   * KO sequence:
   * 1. Check if Pickpocket is armed → save 30 gold before zeroing
   * 2. Set gold = 0 (or 30 if Pickpocket), reset HP to max_hp
   * 3. Consume the Pickpocket effect so it doesn't re-trigger
   * 4. Show the KO overlay via GameContext
   */
  async function handleKO() {
    const player = getPlayer()
    if (!player) return

    let goldToKeep = 0

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

  /** Deducts mana when an ability is activated. Floored at 0. */
  async function deductMana(amount: number) {
    const player = getPlayer()
    if (!player) return
    const { error } = await supabase
      .from('player')
      .update({ mana: Math.max(0, player.mana - amount) })
      .eq('user_id', userId)
    if (error) throw error
    qc.invalidateQueries({ queryKey: ['player', userId] })
  }

  /** Restores HP (e.g. Health Potion). Clamped to max_hp. */
  async function restoreHP(amount: number) {
    const player = getPlayer()
    if (!player) return
    const { error } = await supabase
      .from('player')
      .update({ hp: Math.min(player.hp + amount, player.max_hp) })
      .eq('user_id', userId)
    if (error) throw error
    qc.invalidateQueries({ queryKey: ['player', userId] })
  }

  return {
    hasActiveEffect,
    consumeEffect,
    awardGold,
    awardXP,
    deductHP,
    handleKO,
    deductMana,
    restoreHP,
  }
}
