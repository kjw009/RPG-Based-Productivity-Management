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
  if (type === 'good') return '#14532d'
  if (type === 'bad') return '#7f1d1d'
  return '#3730a3'
}

export default function HabitCard({ habit, consistencyPct, onLog, onDelete, onEdit, isLogging }: Props) {
  const [confirm, setConfirm] = useState(false)
  const { colorFor } = useAreas(habit.user_id)

  const showPositive = habit.type === 'good' || habit.type === 'both'
  const showNegative = habit.type === 'bad' || habit.type === 'both'

  return (
    <div className="inventory-slot px-2 py-1.5" style={{ borderColor: borderColor(habit.type) }}>
      {/* Row 1: title + actions */}
      <div className="flex items-center gap-1.5">
        <span className="font-body text-body-base text-rpg-text flex-1 min-w-0 truncate leading-tight">
          {habit.title}
        </span>
        {confirm ? (
          <div className="flex gap-0.5 flex-shrink-0">
            <PixelButton size="xs" variant="danger" onClick={() => onDelete(habit.id)}>✓</PixelButton>
            <PixelButton size="xs" variant="primary" onClick={() => setConfirm(false)}>✗</PixelButton>
          </div>
        ) : (
          <div className="flex gap-0.5 flex-shrink-0">
            <PixelButton size="xs" variant="primary" onClick={() => onEdit(habit)}>✎</PixelButton>
            <PixelButton size="xs" variant="danger" onClick={() => setConfirm(true)}>×</PixelButton>
          </div>
        )}
      </div>

      {/* Row 2: gem, count, gold/hp, consistency, areas, log buttons */}
      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
        <DifficultyGem difficulty={habit.difficulty} />
        <span className="font-pixel text-pixel-xs text-rpg-muted">×{habit.total_count}</span>
        {showPositive && (
          <span className="font-pixel text-pixel-xs text-rpg-green">+{calculateHabitGold(habit.difficulty)}g</span>
        )}
        {showNegative && (
          <span className="font-pixel text-pixel-xs text-rpg-hp">-{calculateBadHabitHP(habit.difficulty)}hp</span>
        )}
        <span className="font-pixel text-pixel-xs text-rpg-muted">{consistencyPct}%</span>
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
