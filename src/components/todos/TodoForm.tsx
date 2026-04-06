import { useState } from 'react'
import PixelPanel from '../shared/PixelPanel'
import PixelButton from '../shared/PixelButton'
import AreaSelector from '../shared/AreaSelector'
import PixelDatePicker from '../shared/PixelDatePicker'
import type { Project } from '../../types'

interface Props {
  userId: string
  projects: Project[]
  defaultProjectId?: string | null
  onAdd: (payload: {
    title: string
    description: string
    project_id: string | null
    areas: string[]
    difficulty: number
    due_date: string | null
  }) => void
  onCancel: () => void
  isLoading: boolean
}

export default function TodoForm({ userId, projects, defaultProjectId, onAdd, onCancel, isLoading }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState<string>(defaultProjectId ?? '')
  const [areas, setAreas] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState(1)
  const [dueDate, setDueDate] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({
      title: title.trim(),
      description: description.trim(),
      project_id: projectId || null,
      areas,
      difficulty,
      due_date: dueDate,
    })
  }

  return (
    <PixelPanel>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="font-pixel text-pixel-xs text-rpg-gold mb-1">NEW QUEST</div>

        <input
          className="pixel-input"
          placeholder="Todo title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          autoFocus
        />

        <textarea
          className="pixel-input resize-none"
          placeholder="Description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          rows={2}
        />

        {projects.length > 0 && (
          <select className="pixel-select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">No project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        )}

        <AreaSelector userId={userId} selected={areas} onChange={setAreas} />

        <div>
          <div className="font-pixel text-pixel-xs text-rpg-muted mb-2">DIFFICULTY</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((d) => (
              <button type="button" key={d} onClick={() => setDifficulty(d)}
                className={`pixel-btn pixel-btn-sm ${difficulty === d ? 'pixel-btn-gold' : 'pixel-btn-primary'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="font-pixel text-pixel-xs text-rpg-muted mb-2">DUE DATE</div>
          <PixelDatePicker value={dueDate} onChange={setDueDate} />
        </div>

        <div className="flex gap-2 mt-1">
          <PixelButton type="submit" variant="success" size="sm" disabled={isLoading || !title.trim()}>
            {isLoading ? '...' : 'ADD QUEST'}
          </PixelButton>
          <PixelButton type="button" variant="danger" size="sm" onClick={onCancel}>CANCEL</PixelButton>
        </div>
      </form>
    </PixelPanel>
  )
}
