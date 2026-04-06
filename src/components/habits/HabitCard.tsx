import { useState } from 'react'
import DifficultyGem from '../shared/DifficultyGem'
import PixelButton from '../shared/PixelButton'
import ProgressBar from '../shared/ProgressBar'
import AreaTag from '../shared/AreaTag'
import { useAreas } from '../../hooks/useAreas'
import { calculateHabitGold, calculateBadHabitHP } from '../../lib/gameRules'
import type { Habit } from '../../types'

interface Props {
  habit: Habit
  consistencyPct: number
  // direction is which side was pressed — 'good' awards gold, 'bad' deducts HP
  onLog: (habit: Habit, direction: 'good' | 'bad') => void
  onDelete: (habitId: string) => void
  onEdit: (habit: Habit) => void
  isLogging: boolean
}

// Border colour reflects habit type
function borderColor(type: Habit['type']) {
  if (type === 'good') return '#14532d'
  if (type === 'bad') return '#7f1d1d'
  return '#3730a3' // both — indigo
}

export default function HabitCard({ habit, consistencyPct, onLog, onDelete, onEdit, isLogging }: Props) {
  const [confirm, setConfirm] = useState(false)
  const { colorFor } = useAreas(habit.user_id)

  const showPositive = habit.type === 'good' || habit.type === 'both'
  const showNegative = habit.type === 'bad' || habit.type === 'both'

  return (
    <div className="inventory-slot p-3" style={{ borderColor: borderColor(habit.type) }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="font-body text-body-base text-rpg-text">{habit.title}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <DifficultyGem difficulty={habit.difficulty} />
            <span className="font-pixel text-pixel-xs text-rpg-muted">×{habit.total_count}</span>
            {showPositive && (
              <span className="font-pixel text-pixel-xs text-rpg-green">+{calculateHabitGold(habit.difficulty)}g</span>
            )}
            {showNegative && (
              <span className="font-pixel text-pixel-xs text-rpg-hp">-{calculateBadHabitHP(habit.difficulty)}hp</span>
            )}
          </div>
          {habit.areas.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {habit.areas.map((a) => <AreaTag key={a} name={a} color={colorFor(a)} />)}
            </div>
          )}
        </div>

        {/* Delete / edit buttons */}
        {confirm ? (
          <div className="flex gap-1 flex-shrink-0">
            <PixelButton size="xs" variant="danger" onClick={() => onDelete(habit.id)}>✓</PixelButton>
            <PixelButton size="xs" variant="primary" onClick={() => setConfirm(false)}>✗</PixelButton>
          </div>
        ) : (
          <div className="flex gap-1 flex-shrink-0">
            <PixelButton size="xs" variant="primary" onClick={() => onEdit(habit)}>✎</PixelButton>
            <PixelButton size="xs" variant="danger" onClick={() => setConfirm(true)}>×</PixelButton>
          </div>
        )}
      </div>

      {/* 30-day consistency bar */}
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span className="font-pixel text-pixel-xs text-rpg-muted">30-DAY</span>
          <span className="font-pixel text-pixel-xs text-rpg-text">{consistencyPct}%</span>
        </div>
        <ProgressBar value={consistencyPct} variant={habit.type === 'bad' ? 'hp' : 'xp'} height={8} />
      </div>

      {/* Action buttons — one row, show whichever apply */}
      <div className="flex gap-2">
        {showPositive && (
          <PixelButton
            size="sm"
            variant="success"
            onClick={() => onLog(habit, 'good')}
            disabled={isLogging}
            className="flex-1"
          >
            {isLogging ? '...' : '+ DID IT'}
          </PixelButton>
        )}
        {showNegative && (
          <PixelButton
            size="sm"
            variant="danger"
            onClick={() => onLog(habit, 'bad')}
            disabled={isLogging}
            className="flex-1"
          >
            {isLogging ? '...' : '− SLIPPED'}
          </PixelButton>
        )}
      </div>
    </div>
  )
}
