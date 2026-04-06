import ProgressBar from '../shared/ProgressBar'
import PixelButton from '../shared/PixelButton'
import AreaTag from '../shared/AreaTag'
import { useAreas } from '../../hooks/useAreas'
import type { Project } from '../../types'

interface Props {
  project: Project
  progress: { completed: number; total: number; pct: number }
  isSelected: boolean
  onSelect: () => void
  onDelete: (id: string) => void
  onEdit: (project: Project) => void
}

export default function ProjectCard({ project, progress, isSelected, onSelect, onDelete, onEdit }: Props) {
  const { colorFor } = useAreas(project.user_id)

  return (
    <div
      className={`inventory-slot p-3 cursor-pointer ${isSelected ? 'armed-glow' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="font-pixel text-pixel-xs text-rpg-text leading-relaxed truncate">
            {project.title}
          </div>
          {project.description && (
            <div className="font-body text-body-sm text-rpg-muted mt-1 line-clamp-2">
              {project.description}
            </div>
          )}
          {project.areas.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {project.areas.map((a) => <AreaTag key={a} name={a} color={colorFor(a)} />)}
            </div>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <PixelButton
            size="xs"
            variant="primary"
            onClick={(e) => { e.stopPropagation(); onEdit(project) }}
          >
            ✎
          </PixelButton>
          <PixelButton
            size="xs"
            variant="danger"
            onClick={(e) => { e.stopPropagation(); onDelete(project.id) }}
          >
            ×
          </PixelButton>
        </div>
      </div>

      <ProgressBar value={progress.pct} variant="xp" height={10} segmented />
      <div className="flex justify-between mt-1">
        <span className="font-pixel text-pixel-xs text-rpg-muted">{progress.completed}/{progress.total} tasks</span>
        <span className="font-pixel text-pixel-xs text-rpg-green">{progress.pct}%</span>
      </div>
      {isSelected && <div className="font-pixel text-pixel-xs text-rpg-gold mt-2">▶ SELECTED</div>}
    </div>
  )
}
