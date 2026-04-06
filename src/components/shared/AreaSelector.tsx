import { useState } from 'react'
import { useAreas } from '../../hooks/useAreas'
import { AREA_COLOR_PRESETS } from '../../types'
import AreaTag from './AreaTag'

interface Props {
  userId: string
  selected: string[]        // area names currently selected on this entity
  onChange: (areas: string[]) => void
}

/**
 * Multi-select area tag picker with inline "create new area" flow.
 *
 * - Existing areas shown as toggleable chips
 * - "+ New Area" expands an inline form: name + colour picker
 * - Creating a new area saves it to the areas table AND selects it
 */
export default function AreaSelector({ userId, selected, onChange }: Props) {
  const { data: areas, addArea, deleteArea } = useAreas(userId)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(AREA_COLOR_PRESETS[0])

  function toggle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((a) => a !== name))
    } else {
      onChange([...selected, name])
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return

    await addArea.mutateAsync({ name, color: newColor })
    // Auto-select the newly created area
    onChange([...selected, name])
    setNewName('')
    setNewColor(AREA_COLOR_PRESETS[0])
    setShowCreate(false)
  }

  return (
    <div>
      <div className="font-pixel text-pixel-xs text-rpg-muted mb-2">AREAS</div>

      {/* Existing area chips */}
      <div className="flex flex-wrap gap-1 mb-2">
        {(areas ?? []).map((area) => {
          const isSelected = selected.includes(area.name)
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => toggle(area.name)}
              className="inline-flex items-center gap-1 px-2 py-0.5 font-pixel text-pixel-xs transition-none"
              style={{
                backgroundColor: isSelected ? area.color + '33' : 'transparent',
                border: `2px solid ${isSelected ? area.color : '#2a2a5e'}`,
                color: isSelected ? area.color : '#64748b',
              }}
            >
              {area.name}
            </button>
          )
        })}

        {/* Add new area toggle */}
        {!showCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center px-2 py-0.5 font-pixel text-pixel-xs"
            style={{ border: '2px dashed #2a2a5e', color: '#64748b' }}
          >
            + new
          </button>
        )}
      </div>

      {/* Inline create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="pixel-panel p-3 flex flex-col gap-2"
        >
          <div className="font-pixel text-pixel-xs text-rpg-gold">NEW AREA</div>
          <input
            className="pixel-input"
            placeholder="e.g. Learning, Health, Work..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={30}
            autoFocus
            required
          />

          {/* Colour presets */}
          <div className="flex gap-1 flex-wrap">
            {AREA_COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: c,
                  border: newColor === c ? '3px solid #fff' : '2px solid transparent',
                  outline: newColor === c ? `2px solid ${c}` : 'none',
                }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="pixel-btn pixel-btn-success pixel-btn-xs"
              disabled={addArea.isPending || !newName.trim()}
            >
              {addArea.isPending ? '...' : 'CREATE'}
            </button>
            <button
              type="button"
              className="pixel-btn pixel-btn-danger pixel-btn-xs"
              onClick={() => { setShowCreate(false); setNewName('') }}
            >
              CANCEL
            </button>
          </div>
        </form>
      )}

      {/* Manage existing areas (delete) */}
      {(areas ?? []).length > 0 && !showCreate && (
        <details className="mt-1">
          <summary className="font-pixel text-pixel-xs text-rpg-muted cursor-pointer">
            manage areas
          </summary>
          <div className="flex flex-wrap gap-1 mt-2">
            {(areas ?? []).map((area) => (
              <AreaTag
                key={area.id}
                name={area.name}
                color={area.color}
                onRemove={() => deleteArea.mutate(area.id)}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
