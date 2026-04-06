import { useState } from 'react'
import SectionHeader from '../shared/SectionHeader'
import PixelButton from '../shared/PixelButton'
import ProjectCard from './ProjectCard'
import ProjectForm from './ProjectForm'
import { useProjects } from '../../hooks/useProjects'

interface Props {
  userId: string
  selectedProjectId: string | null
  onSelectProject: (id: string | null) => void
}

export default function ProjectGrid({ userId, selectedProjectId, onSelectProject }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const { data: projects, isLoading, addProject, deleteProject, updateProject, projectProgress } = useProjects(userId)

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

  return (
    <section>
      <SectionHeader title="PROJECTS" sub={projects ? `${projects.length}` : ''} />

      {isLoading && <div className="font-body text-body-base text-rpg-muted p-2">Loading...</div>}

      {selectedProjectId && (
        <div className="mb-2">
          <PixelButton size="sm" variant="primary" onClick={() => onSelectProject(null)}>
            ← ALL PROJECTS
          </PixelButton>
        </div>
      )}

      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {(projects ?? []).map((p) => editingId === p.id ? (
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
    </section>
  )
}
