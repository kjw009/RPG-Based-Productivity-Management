import type { Area } from '../../types'

interface Props {
  area: Area
  projectCount: number
  questCount: number
  isSelected: boolean
  onSelect: () => void
}

export default function AreaCard({ area, projectCount, questCount, isSelected, onSelect }: Props) {
  return (
    <div
      className={`inventory-slot px-2 py-1.5 cursor-pointer ${isSelected ? 'armed-glow' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2.5 h-2.5 flex-shrink-0 rounded-sm"
          style={{ backgroundColor: area.color }}
        />
        <span className="font-pixel text-pixel-xs text-rpg-text truncate flex-1 min-w-0">
          {area.name}
        </span>
      </div>
      <div className="flex gap-3 mt-1">
        <span className="font-pixel text-pixel-xs text-rpg-muted">
          {projectCount} proj
        </span>
        <span className="font-pixel text-pixel-xs text-rpg-muted">
          {questCount} quest{questCount !== 1 ? 's' : ''}
        </span>
      </div>
      {isSelected && <div className="font-pixel text-pixel-xs text-rpg-gold mt-1">▶ SELECTED</div>}
    </div>
  )
}
