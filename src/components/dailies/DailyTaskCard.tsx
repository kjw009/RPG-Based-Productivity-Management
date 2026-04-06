import { useState } from 'react'
import DifficultyGem from '../shared/DifficultyGem'
import StreakCounter from '../shared/StreakCounter'
import PixelButton from '../shared/PixelButton'
import AreaTag from '../shared/AreaTag'
import { useAreas } from '../../hooks/useAreas'
import { calculateDailyGold, todayStr } from '../../lib/gameRules'
import type { DailyTask } from '../../types'

interface Props {
  task: DailyTask
  onComplete: (task: DailyTask) => void
  onDelete: (taskId: string) => void
  onEdit: (task: DailyTask) => void
  isCompleting: boolean
}

export default function DailyTaskCard({ task, onComplete, onDelete, onEdit, isCompleting }: Props) {
  const [confirm, setConfirm] = useState(false)
  const { colorFor } = useAreas(task.user_id)
  const today = todayStr()
  const isDone = task.last_completed_date === today
  const goldPreview = calculateDailyGold(task.difficulty, task.streak)

  return (
    <div className={`inventory-slot px-2 py-1.5 ${isDone ? 'completed-dim' : ''}`}>
      {/* Top row: checkbox + title + actions */}
      <div className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={isDone}
          disabled={isDone || isCompleting}
          onChange={() => !isDone && onComplete(task)}
          className="pixel-checkbox cursor-pointer flex-shrink-0"
          aria-label={`Complete ${task.title}`}
        />
        <span className={`font-body text-body-base leading-tight flex-1 min-w-0 truncate ${isDone ? 'text-rpg-muted' : 'text-rpg-text'}`}>
          {task.title}
        </span>
        {confirm ? (
          <div className="flex gap-0.5 flex-shrink-0">
            <PixelButton size="xs" variant="danger" onClick={() => onDelete(task.id)}>✓</PixelButton>
            <PixelButton size="xs" variant="primary" onClick={() => setConfirm(false)}>✗</PixelButton>
          </div>
        ) : (
          <div className="flex gap-0.5 flex-shrink-0">
            <PixelButton size="xs" variant="primary" onClick={() => onEdit(task)}>✎</PixelButton>
            <PixelButton size="xs" variant="danger" onClick={() => setConfirm(true)}>×</PixelButton>
          </div>
        )}
      </div>

      {/* Bottom row: gem, streak, gold/done, area tags */}
      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
        <DifficultyGem difficulty={task.difficulty} />
        <StreakCounter streak={task.streak} size="sm" />
        {!isDone && (
          <span className="font-pixel text-pixel-xs text-rpg-gold">+{goldPreview}g</span>
        )}
        {isDone && (
          <span className="font-pixel text-pixel-xs text-rpg-green">✓</span>
        )}
        {task.areas.map((a) => (
          <AreaTag key={a} name={a} color={colorFor(a)} />
        ))}
      </div>
    </div>
  )
}
