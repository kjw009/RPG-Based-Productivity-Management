import { useState } from 'react'
import PixelPanel from '../shared/PixelPanel'
import PixelButton from '../shared/PixelButton'
import AreaSelector from '../shared/AreaSelector'

interface HabitFormValues {
  title: string
  type: 'good' | 'bad' | 'both'
  difficulty: number
  areas: string[]
}

interface Props {
  userId: string
  initialValues?: HabitFormValues
  label?: string
  onAdd: (payload: HabitFormValues) => void
  onCancel: () => void
  isLoading: boolean
  error?: string | null
}

export default function HabitForm({ userId, initialValues, label, onAdd, onCancel, isLoading, error }: Props) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [type, setType] = useState<'good' | 'bad' | 'both'>(initialValues?.type ?? 'good')
  const [difficulty, setDifficulty] = useState(initialValues?.difficulty ?? 1)
  const [areas, setAreas] = useState<string[]>(initialValues?.areas ?? [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), type, difficulty, areas })
  }

  return (
    <PixelPanel>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="font-pixel text-pixel-xs text-rpg-gold mb-1">{label ?? (initialValues ? 'EDIT HABIT' : 'NEW HABIT')}</div>

        <input
          className="pixel-input"
          placeholder="Habit name..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          required
          autoFocus
        />

        {/* Type selector: positive / negative / both */}
        <div>
          <div className="font-pixel text-pixel-xs text-rpg-muted mb-2">TYPE</div>
          <div className="flex gap-2">
            <button
              type="button"
              className={`pixel-btn pixel-btn-sm ${type === 'good' ? 'pixel-btn-success' : 'pixel-btn-primary'}`}
              onClick={() => setType('good')}
            >
              + POSITIVE
            </button>
            <button
              type="button"
              className={`pixel-btn pixel-btn-sm ${type === 'bad' ? 'pixel-btn-danger' : 'pixel-btn-primary'}`}
              onClick={() => setType('bad')}
            >
              − NEGATIVE
            </button>
            <button
              type="button"
              className={`pixel-btn pixel-btn-sm ${type === 'both' ? 'pixel-btn-gold' : 'pixel-btn-primary'}`}
              onClick={() => setType('both')}
            >
              ± BOTH
            </button>
          </div>
          <div className="font-pixel text-pixel-xs text-rpg-muted mt-1">
            {type === 'good' && 'Awards gold when logged'}
            {type === 'bad' && 'Deducts HP when logged'}
            {type === 'both' && 'Log + to earn gold, − to lose HP'}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <div className="font-pixel text-pixel-xs text-rpg-muted mb-2">DIFFICULTY</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setDifficulty(d)}
                className={`pixel-btn pixel-btn-sm ${difficulty === d ? 'pixel-btn-gold' : 'pixel-btn-primary'}`}
              >
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
            {isLoading ? 'SAVING...' : initialValues ? 'SAVE CHANGES' : 'ADD'}
          </PixelButton>
          <PixelButton type="button" variant="danger" size="sm" onClick={onCancel}>CANCEL</PixelButton>
        </div>
      </form>
    </PixelPanel>
  )
}
