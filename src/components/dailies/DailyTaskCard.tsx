/**
 * Card display for a daily task, including status and action buttons.
 */
import { useState } from 'react'
import DifficultyGem from '../shared/DifficultyGem'
import StreakCounter from '../shared/StreakCounter'
import PixelButton from '../shared/PixelButton'
import AreaTag from '../shared/AreaTag'
import { useAreas } from '../../hooks/useAreas'
import { todayStr } from '../../lib/gameRules'
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

  return (
    <div className={`group inventory-slot px-2 py-1.5 ${isDone ? 'completed-dim' : ''}`}>
      <div className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={isDone}
          disabled={isDone || isCompleting}
          onChange={() => !isDone && onComplete(task)}
          className="pixel-checkbox cursor-pointer flex-shrink-0"
          aria-label={`Complete ${task.title}`}
        />
        <span className={`font-grimoire text-grimoire-base leading-tight flex-1 min-w-0 truncate ${isDone ? 'ink-muted' : 'ink-text'}`}>
          {task.title}
        </span>
        {confirm ? (
          <div className="flex gap-0.5 flex-shrink-0">
            <PixelButton size="xs" variant="danger" onClick={() => onDelete(task.id)}>✓</PixelButton>
            <PixelButton size="xs" variant="primary" onClick={() => setConfirm(false)}>✗</PixelButton>
          </div>
        ) : (
          <div className="flex gap-0.5 flex-shrink-0 max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all">
            <PixelButton size="xs" variant="primary" onClick={() => onEdit(task)}>✎</PixelButton>
            <PixelButton size="xs" variant="danger" onClick={() => setConfirm(true)}>×</PixelButton>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
        <DifficultyGem difficulty={task.difficulty} />
        <StreakCounter streak={task.streak} size="sm" />
        {!isDone && (
          <span className="font-grimoire text-grimoire-sm ink-gold font-bold"></span>
        )}
        {isDone && (
          <span className="font-grimoire text-grimoire-sm ink-green font-bold">✓</span>
        )}
        {task.areas.map((a) => (
          <AreaTag key={a} name={a} color={colorFor(a)} />
        ))}
      </div>
    </div>
  )
}
