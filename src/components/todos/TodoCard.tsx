import { useState } from 'react'
import DifficultyGem from '../shared/DifficultyGem'
import PixelButton from '../shared/PixelButton'
import { calculateTodoGold } from '../../lib/gameRules'
import type { Todo, Project } from '../../types'

interface Props {
  todo: Todo
  project?: Project
  isOverdue: boolean
  onComplete: (todo: Todo) => void
  onDelete: (id: string) => void
  isCompleting: boolean
}

export default function TodoCard({ todo, project, isOverdue, onComplete, onDelete, isCompleting }: Props) {
  const [confirm, setConfirm] = useState(false)

  return (
    <div
      className={`inventory-slot p-3 flex items-start gap-3 ${
        todo.completed ? 'completed-dim' : isOverdue ? 'overdue-glow' : ''
      }`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.completed}
        disabled={todo.completed || isCompleting}
        onChange={() => !todo.completed && onComplete(todo)}
        className="pixel-checkbox mt-1 cursor-pointer flex-shrink-0"
        aria-label={`Complete ${todo.title}`}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`font-body text-body-base ${todo.completed ? 'text-rpg-muted' : 'text-rpg-text'}`}>
          {todo.title}
        </div>

        {todo.description && (
          <div className="font-body text-body-sm text-rpg-muted mt-0.5 line-clamp-2">
            {todo.description}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <DifficultyGem difficulty={todo.difficulty} />

          {project && (
            <span className="font-pixel text-pixel-xs text-rpg-muted bg-rpg-surface px-1 py-0.5">
              {project.title}
            </span>
          )}

          {todo.area.length > 0 && todo.area.map((a) => (
            <span key={a} className="font-pixel text-pixel-xs text-rpg-purple bg-rpg-surface px-1 py-0.5">
              {a}
            </span>
          ))}

          {!todo.completed && (
            <span className="font-pixel text-pixel-xs text-rpg-gold">
              +{calculateTodoGold(todo.difficulty)}g
            </span>
          )}

          {todo.shadow_stepped && (
            <span className="font-pixel text-pixel-xs text-rpg-muted" title="Shadow stepped — extended 3 days">
              👤+3d
            </span>
          )}
        </div>

        {/* Due date */}
        {todo.due_date && (
          <div className={`font-pixel text-pixel-xs mt-1 ${
            isOverdue ? 'text-rpg-hp animate-blink' : 'text-rpg-muted'
          }`}>
            {isOverdue ? '⚠ OVERDUE: ' : 'DUE: '}{todo.due_date}
          </div>
        )}
      </div>

      {/* Delete */}
      {confirm ? (
        <div className="flex gap-1 flex-shrink-0">
          <PixelButton size="xs" variant="danger" onClick={() => onDelete(todo.id)}>✓</PixelButton>
          <PixelButton size="xs" variant="primary" onClick={() => setConfirm(false)}>✗</PixelButton>
        </div>
      ) : (
        <PixelButton size="xs" variant="danger" onClick={() => setConfirm(true)} className="flex-shrink-0">×</PixelButton>
      )}
    </div>
  )
}
