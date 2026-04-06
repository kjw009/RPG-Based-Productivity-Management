import { useState } from 'react'
import DifficultyGem from '../shared/DifficultyGem'
import PixelButton from '../shared/PixelButton'
import AreaTag from '../shared/AreaTag'
import { useAreas } from '../../hooks/useAreas'
import { calculateTodoGold } from '../../lib/gameRules'
import type { Todo, Project } from '../../types'

interface Props {
  todo: Todo
  project?: Project
  isOverdue: boolean
  onComplete: (todo: Todo) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
  isCompleting: boolean
}

export default function TodoCard({ todo, project, isOverdue, onComplete, onDelete, onEdit, isCompleting }: Props) {
  const [confirm, setConfirm] = useState(false)
  const { colorFor } = useAreas(todo.user_id)

  return (
    <div
      className={`inventory-slot px-2 py-1.5 ${
        todo.completed ? 'completed-dim' : isOverdue ? 'overdue-glow' : ''
      }`}
    >
      {/* Top row: checkbox + title + actions */}
      <div className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={todo.completed}
          disabled={todo.completed || isCompleting}
          onChange={() => !todo.completed && onComplete(todo)}
          className="pixel-checkbox cursor-pointer flex-shrink-0"
          aria-label={`Complete ${todo.title}`}
        />
        <span className={`font-body text-body-base leading-tight flex-1 min-w-0 truncate ${todo.completed ? 'text-rpg-muted' : 'text-rpg-text'}`}>
          {todo.title}
        </span>
        {confirm ? (
          <div className="flex gap-0.5 flex-shrink-0">
            <PixelButton size="xs" variant="danger" onClick={() => onDelete(todo.id)}>✓</PixelButton>
            <PixelButton size="xs" variant="primary" onClick={() => setConfirm(false)}>✗</PixelButton>
          </div>
        ) : (
          <div className="flex gap-0.5 flex-shrink-0">
            {!todo.completed && (
              <PixelButton size="xs" variant="primary" onClick={() => onEdit(todo)}>✎</PixelButton>
            )}
            <PixelButton size="xs" variant="danger" onClick={() => setConfirm(true)}>×</PixelButton>
          </div>
        )}
      </div>

      {/* Bottom row: gem, project, gold, due date, areas */}
      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
        <DifficultyGem difficulty={todo.difficulty} />
        {project && (
          <span className="font-pixel text-pixel-xs text-rpg-muted bg-rpg-surface px-1">
            {project.title}
          </span>
        )}
        {!todo.completed && (
          <span className="font-pixel text-pixel-xs text-rpg-gold">+{calculateTodoGold(todo.difficulty)}g</span>
        )}
        {todo.shadow_stepped && (
          <span className="font-pixel text-pixel-xs text-rpg-muted" title="Shadow stepped">👤+3d</span>
        )}
        {todo.due_date && (
          <span className={`font-pixel text-pixel-xs ${isOverdue ? 'text-rpg-hp' : 'text-rpg-muted'}`}>
            {isOverdue ? '⚠' : '⏰'}{todo.due_date}
          </span>
        )}
        {todo.areas.map((a) => (
          <AreaTag key={a} name={a} color={colorFor(a)} />
        ))}
      </div>
    </div>
  )
}
