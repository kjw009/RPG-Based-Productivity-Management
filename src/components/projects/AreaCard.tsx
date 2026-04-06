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
          className="inline-block w-3 h-3 flex-shrink-0 rounded-sm"
          style={{ backgroundColor: area.color, boxShadow: `0 0 4px ${area.color}40` }}
        />
        <span className="font-grimoire text-grimoire-base ink-text truncate flex-1 min-w-0 font-bold">
          {area.name}
        </span>
      </div>
      <div className="flex gap-3 mt-1">
        <span className="font-grimoire text-grimoire-sm ink-muted">{projectCount} proj</span>
        <span className="font-grimoire text-grimoire-sm ink-muted">{questCount} quest{questCount !== 1 ? 's' : ''}</span>
      </div>
      {isSelected && <div className="font-grimoire text-grimoire-sm ink-gold mt-1 font-bold">▶ Selected</div>}
    </div>
  )
}
