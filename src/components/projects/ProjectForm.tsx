import { useState } from 'react'
import PixelPanel from '../shared/PixelPanel'
import PixelButton from '../shared/PixelButton'

interface Props {
  onAdd: (payload: { title: string; description: string }) => void
  onCancel: () => void
  isLoading: boolean
}

export default function ProjectForm({ onAdd, onCancel, isLoading }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), description: description.trim() })
  }

  return (
    <PixelPanel>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="font-pixel text-pixel-xs text-rpg-gold mb-1">NEW PROJECT</div>
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
        <div className="flex gap-2">
          <PixelButton type="submit" variant="success" size="sm" disabled={isLoading || !title.trim()}>
            {isLoading ? '...' : 'CREATE'}
          </PixelButton>
          <PixelButton type="button" variant="danger" size="sm" onClick={onCancel}>
            CANCEL
          </PixelButton>
        </div>
      </form>
    </PixelPanel>
  )
}
