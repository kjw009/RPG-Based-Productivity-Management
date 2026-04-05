import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { endOfToday, endOfWeek, isEffectActive } from '../lib/gameRules'
import { useGameEconomy } from './useGameEconomy'
import type { Ability, ActiveEffect, Player, Todo } from '../types'

async function fetchAbilities(userId: string): Promise<Ability[]> {
  const { data, error } = await supabase
    .from('abilities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

async function fetchActiveEffects(userId: string): Promise<ActiveEffect[]> {
  const { data, error } = await supabase
    .from('active_effects')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
  if (error) throw error
  return data ?? []
}

export function useAbilities(userId: string) {
  const qc = useQueryClient()
  const economy = useGameEconomy(userId)

  const abilitiesQuery = useQuery({
    queryKey: ['abilities', userId],
    queryFn: () => fetchAbilities(userId),
    enabled: !!userId,
  })

  const effectsQuery = useQuery({
    queryKey: ['activeEffects', userId],
    queryFn: () => fetchActiveEffects(userId),
    enabled: !!userId,
  })

  function getPlayer(): Player | null {
    return qc.getQueryData<Player | null>(['player', userId]) ?? null
  }

  function isArmed(effectType: string): boolean {
    const effects = effectsQuery.data ?? []
    return effects.some((e) => e.effect_type === effectType && isEffectActive(e.expires_at))
  }

  function canActivate(ability: Ability): boolean {
    const player = getPlayer()
    if (!player || player.mana < ability.mana_cost) return false
    // Backstab: once per day
    if (ability.effect_type === 'backstab' && isArmed('backstab')) return false
    return true
  }

  const activateAbility = useMutation({
    mutationFn: async ({
      ability,
      targetTodoId,
    }: {
      ability: Ability
      targetTodoId?: string
    }) => {
      const player = getPlayer()
      if (!player || player.mana < ability.mana_cost) {
        throw new Error('Not enough mana')
      }

      // Deduct mana
      await economy.deductMana(ability.mana_cost)

      if (ability.effect_type === 'pickpocket') {
        // Arm pickpocket for next KO — expires in 30 days (semi-permanent until triggered)
        const expires = new Date()
        expires.setDate(expires.getDate() + 30)
        const { error } = await supabase.from('active_effects').insert({
          user_id: userId,
          effect_type: 'pickpocket',
          expires_at: expires.toISOString(),
        })
        if (error) throw error

      } else if (ability.effect_type === 'shadow_step') {
        if (!targetTodoId) throw new Error('No todo selected for Shadow Step')

        // Get the todo from cache and extend its due date by 3 days
        const todos = (qc.getQueryData<Todo[]>(['todos', userId]) ?? []) as Todo[]
        const todo = todos.find((t: Todo) => t.id === targetTodoId)
        if (todo) {
          const base = todo.due_date ? new Date(todo.due_date + 'T00:00:00') : new Date()
          base.setDate(base.getDate() + 3)
          const newDate = base.toISOString().split('T')[0]
          const { error: updateError } = await supabase
            .from('todos')
            .update({ due_date: newDate, shadow_stepped: true })
            .eq('id', targetTodoId)
          if (updateError) throw updateError
          qc.invalidateQueries({ queryKey: ['todos', userId] })
        }

      } else if (ability.effect_type === 'smoke_bomb') {
        const { error } = await supabase.from('active_effects').insert({
          user_id: userId,
          effect_type: 'smoke_bomb',
          expires_at: endOfWeek().toISOString(),
        })
        if (error) throw error

      } else if (ability.effect_type === 'backstab') {
        const { error } = await supabase.from('active_effects').insert({
          user_id: userId,
          effect_type: 'backstab',
          expires_at: endOfToday().toISOString(),
        })
        if (error) throw error
      }

      qc.invalidateQueries({ queryKey: ['activeEffects', userId] })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['abilities', userId] })
    },
  })

  return { abilitiesQuery, effectsQuery, isArmed, canActivate, activateAbility }
}
