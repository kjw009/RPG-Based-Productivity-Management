import { useState } from 'react'
import PixelPanel from '../shared/PixelPanel'
import PixelButton from '../shared/PixelButton'
import AreaSelector from '../shared/AreaSelector'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const WEEKDAYS = [1, 2, 3, 4, 5]

interface Props {
  userId: string
  onAdd: (payload: { title: string; recurrence_days: number[]; difficulty: number; areas: string[] }) => void
  onCancel: () => void
  isLoading: boolean
  error?: string | null
}

export default function AddDailyForm({ userId, onAdd, onCancel, isLoading, error }: Props) {
  const [title, setTitle] = useState('')
  const [days, setDays] = useState<number[]>(WEEKDAYS)
  const [difficulty, setDifficulty] = useState(1)
  const [areas, setAreas] = useState<string[]>([])

  function toggleDay(d: number) {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort())
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || days.length === 0) return
    onAdd({ title: title.trim(), recurrence_days: days, difficulty, areas })
  }

  return (
    <PixelPanel>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="font-pixel text-pixel-xs text-rpg-gold mb-1">NEW DAILY TASK</div>

        <input
          className="pixel-input"
          placeholder="Task name..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          required
          autoFocus
        />

        <div>
          <div className="font-pixel text-pixel-xs text-rpg-muted mb-2">RECURRENCE</div>
          <div className="flex gap-1 flex-wrap">
            {DAY_LABELS.map((label, i) => (
              <button type="button" key={i} onClick={() => toggleDay(i)}
                className={`pixel-btn pixel-btn-sm ${days.includes(i) ? 'pixel-btn-gold' : 'pixel-btn-primary'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

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

        <AreaSelector userId={userId} selected={areas} onChange={setAreas} />

        {error && (
          <div className="pixel-panel-crimson p-2">
            <p className="font-pixel text-pixel-xs text-rpg-hp">{error}</p>
          </div>
        )}

        <div className="flex gap-2 mt-1">
          <PixelButton type="submit" variant="success" size="sm" disabled={isLoading || !title.trim()}>
            {isLoading ? 'SAVING...' : 'ADD'}
          </PixelButton>
          <PixelButton type="button" variant="danger" size="sm" onClick={onCancel}>
            CANCEL
          </PixelButton>
        </div>
      </form>
    </PixelPanel>
  )
}
