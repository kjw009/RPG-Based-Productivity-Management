import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { endOfToday, endOfWeek, isEffectActive } from '../lib/gameRules'
import { useGameEconomy } from './useGameEconomy'
import type { Stratagem, ActiveEffect, Player, Todo } from '../types'

async function fetchStratagems(userId: string): Promise<Stratagem[]> {
  const { data, error } = await supabase
    .from('abilities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

// Only fetches effects that haven't expired yet, so stale rows don't
// show stratagems as "armed" after their window has passed.
async function fetchActiveEffects(userId: string): Promise<ActiveEffect[]> {
  const { data, error } = await supabase
    .from('active_effects')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
  if (error) throw error
  return data ?? []
}

export function useStratagems(userId: string) {
  const qc = useQueryClient()
  const economy = useGameEconomy(userId)

  const stratagemQuery = useQuery({
    queryKey: ['stratagems', userId],
    queryFn: () => fetchStratagems(userId),
    enabled: !!userId,
  })

  // Active effects are shared with useGameEconomy — same query key so they
  // share the same cache entry and don't make duplicate network requests.
  const effectsQuery = useQuery({
    queryKey: ['activeEffects', userId],
    queryFn: () => fetchActiveEffects(userId),
    enabled: !!userId,
  })

  function getPlayer(): Player | null {
    return qc.getQueryData<Player | null>(['player', userId]) ?? null
  }

  /** Returns true if a non-expired effect of this type exists. */
  function isArmed(effectType: string): boolean {
    return (effectsQuery.data ?? []).some(
      (e) => e.effect_type === effectType && isEffectActive(e.expires_at)
    )
  }

  /**
   * A stratagem can only be activated if:
   * - The player has enough mana
   * - Backstab isn't already active (once-per-day restriction)
   */
  function canActivate(stratagem: Stratagem): boolean {
    const player = getPlayer()
    if (!player || player.mana < stratagem.mana_cost) return false
    if (stratagem.effect_type === 'backstab' && isArmed('backstab')) return false
    return true
  }

  const activateStratagem = useMutation({
    mutationFn: async ({
      stratagem,
      targetTodoId,
    }: {
      stratagem: Stratagem
      targetTodoId?: string
    }) => {
      const player = getPlayer()
      if (!player || player.mana < stratagem.mana_cost) {
        throw new Error('Not enough mana')
      }

      await economy.deductMana(stratagem.mana_cost)

      if (stratagem.effect_type === 'pickpocket') {
        // Arm Pickpocket for 30 days — it stays active until the next KO,
        // at which point useGameEconomy.handleKO consumes and removes it.
        const expires = new Date()
        expires.setDate(expires.getDate() + 30)
        const { error } = await supabase.from('active_effects').insert({
          user_id: userId,
          effect_type: 'pickpocket',
          expires_at: expires.toISOString(),
        })
        if (error) throw error

      } else if (stratagem.effect_type === 'shadow_step') {
        // Shadow Step: extend the selected todo's due_date by 3 days and flag
        // it so the daily reset skips the overdue HP penalty for that todo.
        if (!targetTodoId) throw new Error('No todo selected for Shadow Step')

        const todos = (qc.getQueryData<Todo[]>(['todos', userId]) ?? []) as Todo[]
        const todo = todos.find((t: Todo) => t.id === targetTodoId)
        if (todo) {
          const base = todo.due_date ? new Date(todo.due_date + 'T00:00:00') : new Date()
          base.setDate(base.getDate() + 3)
          const { error } = await supabase
            .from('todos')
            .update({
              due_date: base.toISOString().split('T')[0],
              shadow_stepped: true,
            })
            .eq('id', targetTodoId)
          if (error) throw error
          qc.invalidateQueries({ queryKey: ['todos', userId] })
        }

      } else if (stratagem.effect_type === 'smoke_bomb') {
        // Smoke Bomb: blocks the next bad habit HP deduction this week.
        // useHabits.logHabit checks for this effect and consumes it on use.
        const { error } = await supabase.from('active_effects').insert({
          user_id: userId,
          effect_type: 'smoke_bomb',
          expires_at: endOfWeek().toISOString(),
        })
        if (error) throw error

      } else if (stratagem.effect_type === 'backstab') {
        // Backstab: triple gold on the next streak completion today.
        // Expires at end of day — useDailies.completeTask consumes it on use.
        const { error } = await supabase.from('active_effects').insert({
          user_id: userId,
          effect_type: 'backstab',
          expires_at: endOfToday().toISOString(),
        })
        if (error) throw error
      }

      qc.invalidateQueries({ queryKey: ['activeEffects', userId] })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stratagems', userId] }),
  })

  return { stratagemQuery, effectsQuery, isArmed, canActivate, activateStratagem }
}
