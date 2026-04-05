import { useState } from 'react'
import DifficultyGem from '../shared/DifficultyGem'
import StreakCounter from '../shared/StreakCounter'
import PixelButton from '../shared/PixelButton'
import { calculateDailyGold, todayStr } from '../../lib/gameRules'
import type { DailyTask } from '../../types'

interface Props {
  task: DailyTask
  onComplete: (task: DailyTask) => void
  onDelete: (taskId: string) => void
  isCompleting: boolean
}

export default function DailyTaskCard({ task, onComplete, onDelete, isCompleting }: Props) {
  const [confirm, setConfirm] = useState(false)
  const today = todayStr()
  const isDone = task.last_completed_date === today
  const goldPreview = calculateDailyGold(task.difficulty, task.streak)

  const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className={`inventory-slot p-3 flex items-start gap-3 ${isDone ? 'completed-dim' : ''}`}>
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isDone}
        disabled={isDone || isCompleting}
        onChange={() => !isDone && onComplete(task)}
        className="pixel-checkbox mt-1 cursor-pointer"
        aria-label={`Complete ${task.title}`}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`font-body text-body-base ${isDone ? 'text-rpg-muted' : 'text-rpg-text'}`}>
          {task.title}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <DifficultyGem difficulty={task.difficulty} />
          <StreakCounter streak={task.streak} size="sm" />
          {!isDone && (
            <span className="font-pixel text-pixel-xs text-rpg-gold">+{goldPreview}g</span>
          )}
          {isDone && (
            <span className="font-pixel text-pixel-xs text-rpg-green">✓ DONE</span>
          )}
        </div>
        {/* Recurrence days */}
        <div className="flex gap-1 mt-2">
          {DAY_LABELS.map((label, i) => (
            <span
              key={i}
              className={`font-pixel text-pixel-xs px-1 ${
                task.recurrence_days.includes(i)
                  ? 'text-rpg-gold bg-rpg-surface'
                  : 'text-rpg-muted'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Delete */}
      {confirm ? (
        <div className="flex gap-1">
          <PixelButton size="xs" variant="danger" onClick={() => onDelete(task.id)}>✓</PixelButton>
          <PixelButton size="xs" variant="primary" onClick={() => setConfirm(false)}>✗</PixelButton>
        </div>
      ) : (
        <PixelButton size="xs" variant="danger" onClick={() => setConfirm(true)}>×</PixelButton>
      )}
    </div>
  )
}
