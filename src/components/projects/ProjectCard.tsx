/**
 * Displays project details, progress, and action buttons in a project card.
 */
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
      className={`inventory-slot p-2 cursor-pointer ${isSelected ? 'armed-glow' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          <div className="font-grimoire text-grimoire-base ink-text leading-tight truncate font-bold">
            {project.title}
          </div>
          {project.description && (
            <div className="font-grimoire text-grimoire-sm ink-muted mt-0.5 line-clamp-2 italic">
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

      <ProgressBar value={progress.pct} variant="xp" height={8} segmented />
      <div className="flex justify-between mt-1">
        <span className="font-grimoire text-grimoire-sm ink-muted">{progress.completed}/{progress.total} tasks</span>
        <span className="font-grimoire text-grimoire-sm ink-green font-bold">{progress.pct}%</span>
      </div>
      {isSelected && <div className="font-grimoire text-grimoire-sm ink-gold mt-1 font-bold">▶ Selected</div>}
    </div>
  )
}
