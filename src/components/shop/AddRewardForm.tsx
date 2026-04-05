import { useState } from 'react'
import PixelPanel from '../shared/PixelPanel'
import PixelButton from '../shared/PixelButton'

interface Props {
  onAdd: (payload: { name: string; description: string; cost: number }) => void
  onCancel: () => void
  isLoading: boolean
}

export default function AddRewardForm({ onAdd, onCancel, isLoading }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState(100)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || cost < 0) return
    onAdd({ name: name.trim(), description: description.trim(), cost })
  }

  return (
    <PixelPanel>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="font-pixel text-pixel-xs text-rpg-gold mb-1">ADD CUSTOM REWARD</div>
        <input
          className="pixel-input"
          placeholder="Reward name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          required
          autoFocus
        />
        <textarea
          className="pixel-input resize-none"
          placeholder="Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
          rows={2}
        />
        <div>
          <div className="font-pixel text-pixel-xs text-rpg-muted mb-2">GOLD COST</div>
          <input
            type="number"
            className="pixel-input"
            value={cost}
            onChange={(e) => setCost(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            max={99999}
          />
        </div>
        <div className="flex gap-2">
          <PixelButton type="submit" variant="success" size="sm" disabled={isLoading || !name.trim()}>
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
