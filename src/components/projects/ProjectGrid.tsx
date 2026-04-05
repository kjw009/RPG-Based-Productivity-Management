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
  const { data: projects, isLoading, addProject, deleteProject, projectProgress } = useProjects(userId)

  return (
    <section>
      <SectionHeader title="PROJECTS" sub={projects ? `${projects.length}` : ''} />

      {isLoading && (
        <div className="font-body text-body-base text-rpg-muted p-2">Loading...</div>
      )}

      {/* Filter controls */}
      {selectedProjectId && (
        <div className="mb-2">
          <PixelButton size="sm" variant="primary" onClick={() => onSelectProject(null)}>
            ← ALL PROJECTS
          </PixelButton>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {(projects ?? []).map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            progress={projectProgress(p.id)}
            isSelected={selectedProjectId === p.id}
            onSelect={() => onSelectProject(selectedProjectId === p.id ? null : p.id)}
            onDelete={(id) => deleteProject.mutate(id)}
          />
        ))}
      </div>

      {showForm ? (
        <ProjectForm
          onAdd={(payload) => { addProject.mutate(payload); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
          isLoading={addProject.isPending}
        />
      ) : (
        <PixelButton size="sm" variant="success" onClick={() => setShowForm(true)}>
          + NEW PROJECT
        </PixelButton>
      )}
    </section>
  )
}
