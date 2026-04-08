import { useState } from 'react'
import PixelButton from '../shared/PixelButton'
import ProjectCard from './ProjectCard'
import ProjectForm from './ProjectForm'
import AreaCard from './AreaCard'
import { useProjects } from '../../hooks/useProjects'
import { useAreas } from '../../hooks/useAreas'
import { useTodos } from '../../hooks/useTodos'

type ViewMode = 'projects' | 'areas'

interface Props {
  userId: string
  selectedProjectId: string | null
  onSelectProject: (id: string | null) => void
  selectedArea: string | null
  onSelectArea: (area: string | null) => void
}

export default function ProjectGrid({ userId, selectedProjectId, onSelectProject, selectedArea, onSelectArea }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('projects')
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const { data: projects, isLoading, addProject, deleteProject, updateProject, projectProgress } = useProjects(userId)
  const { data: areas } = useAreas(userId)
  const { data: todos } = useTodos(userId)

  const allProjects = projects ?? []
  const allAreas = areas ?? []
  const allTodos = todos ?? []

  function switchTo(mode: ViewMode) {
    setViewMode(mode)
    // Clear the other mode's selection
    if (mode === 'projects') onSelectArea(null)
    else onSelectProject(null)
    setEditingId(null)
    setShowForm(false)
  }

  // Area counts
  function projectCountFor(areaName: string) {
    return allProjects.filter((p) => p.areas.includes(areaName)).length
  }
  function questCountFor(areaName: string) {
    return allTodos.filter((t) => !t.completed && t.areas.includes(areaName)).length
  }

  async function handleAdd(payload: Parameters<typeof addProject.mutate>[0]) {
    setFormError(null)
    try {
      await addProject.mutateAsync(payload)
      setShowForm(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save. Check console for details.')
      console.error('[addProject]', err)
    }
  }

  async function handleUpdate(id: string, payload: Parameters<typeof addProject.mutate>[0]) {
    setEditError(null)
    try {
      await updateProject.mutateAsync({ id, ...payload })
      setEditingId(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save. Check console for details.')
      console.error('[updateProject]', err)
    }
  }

  const projectsLabel = viewMode === 'projects' ? 'PROJECTS' : 'projects'
  const areasLabel = viewMode === 'areas' ? 'AREAS' : 'areas'

  return (
    <section>
      {/* Toggle header */}
      <div className="section-header mb-3 flex items-center gap-1">
        <button
          onClick={() => switchTo('projects')}
          className={`bg-transparent border-none cursor-pointer font-inherit text-inherit p-0 ${
            viewMode === 'projects' ? 'text-rpg-text' : 'text-rpg-muted hover:text-rpg-gold'
          }`}
          style={{ fontFamily: "'Orbitron', monospace", fontSize: 'inherit', letterSpacing: 'inherit' }}
        >
          {projectsLabel}
        </button>
        <span className="text-rpg-muted">/</span>
        <button
          onClick={() => switchTo('areas')}
          className={`bg-transparent border-none cursor-pointer font-inherit text-inherit p-0 ${
            viewMode === 'areas' ? 'text-rpg-text' : 'text-rpg-muted hover:text-rpg-gold'
          }`}
          style={{ fontFamily: "'Orbitron', monospace", fontSize: 'inherit', letterSpacing: 'inherit' }}
        >
          {areasLabel}
        </button>
        <span className="text-rpg-gold ml-2 font-grimoire text-grimoire-sm opacity-80">
          {viewMode === 'projects' ? allProjects.length : allAreas.length}
        </span>
      </div>

      {isLoading && <div className="font-grimoire text-grimoire-sm text-rpg-muted p-2">Loading...</div>}

      {/* Clear filter button */}
      {(selectedProjectId || selectedArea) && (
        <div className="mb-2">
          <PixelButton
            size="xs"
            variant="primary"
            onClick={() => { onSelectProject(null); onSelectArea(null) }}
          >
            ← ALL
          </PixelButton>
        </div>
      )}

      {/* ─── PROJECTS VIEW ─── */}
      {viewMode === 'projects' && (
        <>
          <div className="grid gap-1.5 mb-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {allProjects.map((p) => editingId === p.id ? (
              <ProjectForm
                key={p.id}
                userId={userId}
                initialValues={{ title: p.title, description: p.description, areas: p.areas }}
                onAdd={(payload) => handleUpdate(p.id, payload)}
                onCancel={() => { setEditingId(null); setEditError(null) }}
                isLoading={updateProject.isPending}
                error={editError}
              />
            ) : (
              <ProjectCard
                key={p.id}
                project={p}
                progress={projectProgress(p.id)}
                isSelected={selectedProjectId === p.id}
                onSelect={() => onSelectProject(selectedProjectId === p.id ? null : p.id)}
                onDelete={(id) => deleteProject.mutate(id)}
                onEdit={(project) => { setEditingId(project.id); setShowForm(false) }}
              />
            ))}
          </div>

          {showForm ? (
            <ProjectForm
              userId={userId}
              onAdd={handleAdd}
              onCancel={() => { setShowForm(false); setFormError(null) }}
              isLoading={addProject.isPending}
              error={formError}
            />
          ) : (
            <PixelButton size="sm" variant="success" onClick={() => setShowForm(true)}>
              + NEW PROJECT
            </PixelButton>
          )}
        </>
      )}

      {/* ─── AREAS VIEW ─── */}
      {viewMode === 'areas' && (
        <>
          {allAreas.length === 0 && !isLoading && (
            <div className="font-grimoire text-grimoire-sm text-rpg-muted p-2">No areas defined yet.</div>
          )}
          <div className="grid gap-1.5 mb-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {allAreas.map((a) => (
              <AreaCard
                key={a.id}
                area={a}
                projectCount={projectCountFor(a.name)}
                questCount={questCountFor(a.name)}
                isSelected={selectedArea === a.name}
                onSelect={() => onSelectArea(selectedArea === a.name ? null : a.name)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
