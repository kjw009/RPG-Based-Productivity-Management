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
 * Runs the "midnight check" once per calendar day, on the first app load
 * of that day. Tracks the last run date in localStorage so it never runs
 * twice in the same day even if the page reloads.
 *
 * Why batch instead of calling deductHP in a loop?
 * Each deductHP call reads the player from the React Query cache. After the
 * first write the cache invalidation is async, so subsequent reads would see
 * stale (pre-deduction) HP. Batching calculates the total loss upfront and
 * makes a single DB write, avoiding that race.
 */
export function useDailyReset(userId: string) {
  const qc = useQueryClient()
  const player = qc.getQueryData<Player | null>(['player', userId])
  const { triggerKO } = useGameContext()
  const ran = useRef(false) // prevents double-run in React Strict Mode

  useEffect(() => {
    if (!userId || ran.current) return
    ran.current = true

    const today = todayStr()
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY)

    // Already ran today — nothing to do
    if (lastCheck === today) return

    // Mark as run immediately so a mid-run reload doesn't double-penalise
    localStorage.setItem(LAST_CHECK_KEY, today)

    async function runReset() {
      const yesterday = yesterdayStr()
      const yesterdayDow = yesterdayWeekday()

      // Fetch fresh player directly from DB (not cache — cache may be empty
      // on first load before usePlayer has resolved)
      const { data: playerData } = await supabase
        .from('player')
        .select('*')
        .eq('user_id', userId)
        .single()

      const player = playerData as Player | null
      if (!player) return // player row not seeded yet

      let totalHPLoss = 0

      // ── Check missed daily tasks ─────────────────────────────────────────
      const { data: dailies } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', userId)

      const missedIds: string[] = []

      for (const task of (dailies ?? []) as DailyTask[]) {
        // Skip tasks not scheduled for yesterday
        if (!task.recurrence_days.includes(yesterdayDow)) continue
        // Skip tasks completed yesterday
        if (task.last_completed_date === yesterday) continue

        totalHPLoss += calculateMissedDailyHP(task.difficulty, player?.xp ?? 0)
        missedIds.push(task.id)
      }

      // Reset streaks for all missed tasks in one query
      if (missedIds.length > 0) {
        await supabase
          .from('daily_tasks')
          .update({ streak: 0 })
          .in('id', missedIds)
      }

      // ── Check overdue todos ──────────────────────────────────────────────
      // Only fetch todos that haven't had the penalty applied yet
      const { data: todos } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false)
        .eq('overdue_checked', false)
        .lt('due_date', today)

      const overdueIds: string[] = []

      for (const todo of (todos ?? []) as Todo[]) {
        // Shadow-stepped todos had their deadline extended — skip penalty
        if (!todo.shadow_stepped) {
          totalHPLoss += calculateOverdueTodoHP(todo.difficulty, player?.xp ?? 0)
        }
        overdueIds.push(todo.id)
      }

      // Mark all checked in one query regardless of shadow_step status
      if (overdueIds.length > 0) {
        await supabase
          .from('todos')
          .update({ overdue_checked: true })
          .in('id', overdueIds)
      }

      // ── Apply total HP loss ──────────────────────────────────────────────
      if (totalHPLoss > 0) {
        const newHP = player.hp - totalHPLoss

        if (newHP <= 0) {
          // KO — check for Pickpocket before zeroing gold
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

      // Refresh all affected queries so the UI shows current values
      qc.invalidateQueries({ queryKey: ['player', userId] })
      qc.invalidateQueries({ queryKey: ['dailies', userId] })
      qc.invalidateQueries({ queryKey: ['todos', userId] })
      qc.invalidateQueries({ queryKey: ['activeEffects', userId] })
    }

    runReset().catch(console.error)
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps
}
