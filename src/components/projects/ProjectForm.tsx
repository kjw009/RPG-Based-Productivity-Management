import { useState } from 'react'
import PixelPanel from '../shared/PixelPanel'
import PixelButton from '../shared/PixelButton'
import AreaSelector from '../shared/AreaSelector'

interface ProjectFormValues {
  title: string
  description: string
  areas: string[]
}

interface Props {
  userId: string
  initialValues?: ProjectFormValues
  onAdd: (payload: ProjectFormValues) => void
  onCancel: () => void
  isLoading: boolean
  error?: string | null
}

export default function ProjectForm({ userId, initialValues, onAdd, onCancel, isLoading, error }: Props) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [areas, setAreas] = useState<string[]>(initialValues?.areas ?? [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), description: description.trim(), areas })
  }

  return (
    <PixelPanel>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="font-pixel text-pixel-xs text-rpg-gold mb-1">{initialValues ? 'EDIT PROJECT' : 'NEW PROJECT'}</div>
        <input
          className="pixel-input"
          placeholder="Project name..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          required
          autoFocus
        />
        <textarea
          className="pixel-input resize-none"
          placeholder="Description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
          rows={2}
        />
        <AreaSelector userId={userId} selected={areas} onChange={setAreas} />

        {error && (
          <div className="pixel-panel-crimson p-2">
            <p className="font-pixel text-pixel-xs text-rpg-hp">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <PixelButton type="submit" variant="success" size="sm" disabled={isLoading || !title.trim()}>
            {isLoading ? 'SAVING...' : initialValues ? 'SAVE CHANGES' : 'CREATE'}
          </PixelButton>
          <PixelButton type="button" variant="danger" size="sm" onClick={onCancel}>CANCEL</PixelButton>
        </div>
      </form>
    </PixelPanel>
  )
}
