import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  calculateMissedDailyHP,
  calculateOverdueTodoHP,
  PICKPOCKET_GOLD_RECOVERY,
  isEffectActive,
  todayStr,
  yesterdayStr,
  yesterdayWeekday,
} from '../lib/gameRules'
import { useGameContext } from '../context/GameContext'
import type { DailyTask, Todo, Player, ActiveEffect } from '../types'

const LAST_CHECK_KEY = 'rpg_last_daily_check'

/**
 * Runs once per session per day.
 * Batches all HP deductions into a single DB write to avoid stale-cache races.
 */
export function useDailyReset(userId: string) {
  const qc = useQueryClient()
  const { triggerKO } = useGameContext()
  const ran = useRef(false)

  useEffect(() => {
    if (!userId || ran.current) return
    ran.current = true

    const today = todayStr()
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY)

    if (lastCheck === today) return

    // Mark as run for today immediately to prevent double-run
    localStorage.setItem(LAST_CHECK_KEY, today)

    async function runReset() {
      const yesterday = yesterdayStr()
      const yesterdayDow = yesterdayWeekday()

      // Fetch fresh player data directly from DB
      const { data: playerData } = await supabase
        .from('player')
        .select('*')
        .eq('user_id', userId)
        .single()

      const player = playerData as Player | null
      if (!player) return

      let totalHPLoss = 0

      // ── Daily task reset ────────────────────────────────────────
      const { data: dailies } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', userId)

      const allDailies: DailyTask[] = dailies ?? []
      const missedIds: string[] = []

      for (const task of allDailies) {
        if (!task.recurrence_days.includes(yesterdayDow)) continue
        if (task.last_completed_date === yesterday) continue
        totalHPLoss += calculateMissedDailyHP(task.difficulty)
        missedIds.push(task.id)
      }

      // Reset streaks for missed dailies
      if (missedIds.length > 0) {
        await supabase
          .from('daily_tasks')
          .update({ streak: 0 })
          .in('id', missedIds)
      }

      // ── Overdue todos ───────────────────────────────────────────
      const { data: todos } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false)
        .eq('overdue_checked', false)
        .lt('due_date', today)

      const overdueTodos: Todo[] = todos ?? []
      const overdueIds: string[] = []

      for (const todo of overdueTodos) {
        if (!todo.shadow_stepped) {
          totalHPLoss += calculateOverdueTodoHP(todo.difficulty)
        }
        overdueIds.push(todo.id)
      }

      // Mark overdue todos as checked
      if (overdueIds.length > 0) {
        await supabase
          .from('todos')
          .update({ overdue_checked: true })
          .in('id', overdueIds)
      }

      // ── Apply HP loss ───────────────────────────────────────────
      if (totalHPLoss > 0) {
        const newHP = player.hp - totalHPLoss

        if (newHP <= 0) {
          // KO sequence
          const { data: effectsData } = await supabase
            .from('active_effects')
            .select('*')
            .eq('user_id', userId)
            .gt('expires_at', new Date().toISOString())

          const effects: ActiveEffect[] = effectsData ?? []
          const pickpocket = effects.find(
            (e) => e.effect_type === 'pickpocket' && isEffectActive(e.expires_at)
          )

          let goldToKeep = 0
          if (pickpocket) {
            goldToKeep = PICKPOCKET_GOLD_RECOVERY
            await supabase.from('active_effects').delete().eq('id', pickpocket.id)
          }

          await supabase
            .from('player')
            .update({ hp: player.max_hp, gold: goldToKeep })
            .eq('user_id', userId)

          triggerKO()
        } else {
          await supabase
            .from('player')
            .update({ hp: newHP })
            .eq('user_id', userId)
        }
      }

      // Refresh all relevant data
      qc.invalidateQueries({ queryKey: ['player', userId] })
      qc.invalidateQueries({ queryKey: ['dailies', userId] })
      qc.invalidateQueries({ queryKey: ['todos', userId] })
      qc.invalidateQueries({ queryKey: ['activeEffects', userId] })
    }

    runReset().catch(console.error)
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps
}
