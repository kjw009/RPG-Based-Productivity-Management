/**
 * Displays a habit entry with logging options and delete/edit controls.
 */
import { useState } from 'react'
import DifficultyGem from '../shared/DifficultyGem'
import PixelButton from '../shared/PixelButton'
import AreaTag from '../shared/AreaTag'
import { useAreas } from '../../hooks/useAreas'
import { calculateHabitGold, calculateBadHabitHP } from '../../lib/gameRules'
import type { Habit } from '../../types'

interface Props {
  habit: Habit
  consistencyPct: number
  onLog: (habit: Habit, direction: 'good' | 'bad') => void
  onDelete: (habitId: string) => void
  onEdit: (habit: Habit) => void
  isLogging: boolean
}

function borderColor(type: Habit['type']) {
  if (type === 'good') return '#3a6a2a'
  if (type === 'bad') return '#8b1a1a'
  return '#4a3a7a'
}

export default function HabitCard({ habit, consistencyPct, onLog, onDelete, onEdit, isLogging }: Props) {
  const [confirm, setConfirm] = useState(false)
  const { colorFor } = useAreas(habit.user_id)

  const showPositive = habit.type === 'good' || habit.type === 'both'
  const showNegative = habit.type === 'bad' || habit.type === 'both'

  return (
    <div className="group inventory-slot px-2 py-1.5" style={{ borderColor: borderColor(habit.type) }}>
      <div className="flex items-center gap-1.5">
        <span className="font-grimoire text-grimoire-base ink-text flex-1 min-w-0 truncate leading-tight">
          {habit.title}
        </span>
        {confirm ? (
          <div className="flex gap-0.5 flex-shrink-0">
            <PixelButton size="xs" variant="danger" onClick={() => onDelete(habit.id)}>✓</PixelButton>
            <PixelButton size="xs" variant="primary" onClick={() => setConfirm(false)}>✗</PixelButton>
          </div>
        ) : (
          <div className="flex gap-0.5 flex-shrink-0 max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all">
            <PixelButton size="xs" variant="primary" onClick={() => onEdit(habit)}>✎</PixelButton>
            <PixelButton size="xs" variant="danger" onClick={() => setConfirm(true)}>×</PixelButton>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
        <DifficultyGem difficulty={habit.difficulty} />
        <span className="font-grimoire text-grimoire-sm ink-muted">×{habit.total_count}</span>
        {showPositive && (
          <span className="font-grimoire text-grimoire-sm ink-green font-bold">+{calculateHabitGold(habit.difficulty)}g</span>
        )}
        {showNegative && (
          <span className="font-grimoire text-grimoire-sm ink-hp font-bold">-{calculateBadHabitHP(habit.difficulty)}hp</span>
        )}
        <span className="font-grimoire text-grimoire-sm ink-muted">{consistencyPct}%</span>
        {habit.areas.map((a) => (
          <AreaTag key={a} name={a} color={colorFor(a)} />
        ))}
        <div className="flex gap-1 ml-auto flex-shrink-0">
          {showPositive && (
            <PixelButton size="xs" variant="success" onClick={() => onLog(habit, 'good')} disabled={isLogging}>
              +
            </PixelButton>
          )}
          {showNegative && (
            <PixelButton size="xs" variant="danger" onClick={() => onLog(habit, 'bad')} disabled={isLogging}>
              −
            </PixelButton>
          )}
        </div>
      </div>
    </div>
  )
}
