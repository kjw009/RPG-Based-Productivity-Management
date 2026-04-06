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
  onLog: (habit: Habit) => void
  onDelete: (habitId: string) => void
  isLogging: boolean
}

export default function HabitCard({ habit, consistencyPct, onLog, onDelete, isLogging }: Props) {
  const [confirm, setConfirm] = useState(false)
  const { colorFor } = useAreas(habit.user_id)
  const isGood = habit.type === 'good'

  return (
    <div className="inventory-slot p-3" style={!isGood ? { borderColor: '#7f1d1d' } : {}}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="font-body text-body-base text-rpg-text">{habit.title}</div>
          <div className="flex items-center gap-2 mt-1">
            <DifficultyGem difficulty={habit.difficulty} />
            <span className="font-pixel text-pixel-xs text-rpg-muted">×{habit.total_count}</span>
            {isGood
              ? <span className="font-pixel text-pixel-xs text-rpg-green">+{calculateHabitGold(habit.difficulty)}g</span>
              : <span className="font-pixel text-pixel-xs text-rpg-hp">-{calculateBadHabitHP(habit.difficulty)}hp</span>
            }
          </div>
          {habit.areas.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {habit.areas.map((a) => <AreaTag key={a} name={a} color={colorFor(a)} />)}
            </div>
          )}
        </div>

        {confirm ? (
          <div className="flex gap-1 flex-shrink-0">
            <PixelButton size="xs" variant="danger" onClick={() => onDelete(habit.id)}>✓</PixelButton>
            <PixelButton size="xs" variant="primary" onClick={() => setConfirm(false)}>✗</PixelButton>
          </div>
        ) : (
          <PixelButton size="xs" variant="danger" onClick={() => setConfirm(true)} className="flex-shrink-0">×</PixelButton>
        )}
      </div>

      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span className="font-pixel text-pixel-xs text-rpg-muted">30-DAY</span>
          <span className="font-pixel text-pixel-xs text-rpg-text">{consistencyPct}%</span>
        </div>
        <ProgressBar value={consistencyPct} variant={isGood ? 'xp' : 'hp'} height={8} />
      </div>

      <PixelButton size="sm" variant={isGood ? 'success' : 'danger'} onClick={() => onLog(habit)} disabled={isLogging} className="w-full">
        {isLogging ? '...' : '+ DID IT'}
      </PixelButton>
    </div>
  )
}
