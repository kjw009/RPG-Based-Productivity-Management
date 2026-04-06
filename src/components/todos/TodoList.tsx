import { useState } from 'react'
import SectionHeader from '../shared/SectionHeader'
import PixelButton from '../shared/PixelButton'
import PixelPanel from '../shared/PixelPanel'
import TodoCard from './TodoCard'
import TodoForm from './TodoForm'
import { useTodos } from '../../hooks/useTodos'
import { useProjects } from '../../hooks/useProjects'
import type { Project } from '../../types'

interface Props {
  userId: string
  filterProjectId: string | null
  filterArea: string | null
}

export default function TodoList({ userId, filterProjectId, filterArea }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  const { data: todos, isLoading, completeTodo, addTodo, deleteTodo, updateTodo, isOverdue } = useTodos(userId)
  const { data: projects } = useProjects(userId)

  const projectMap = new Map<string, Project>((projects ?? []).map((p) => [p.id, p]))

  let filtered = todos ?? []
  if (filterProjectId) {
    filtered = filtered.filter((t) => t.project_id === filterProjectId)
  }
  if (filterArea) {
    filtered = filtered.filter((t) => t.areas.includes(filterArea))
  }

  const active = filtered.filter((t) => !t.completed)
  const completed = filtered.filter((t) => t.completed)
  const overdue = active.filter((t) => isOverdue(t))
  const upcoming = active.filter((t) => !isOverdue(t))

  const selectedProject = filterProjectId ? projectMap.get(filterProjectId) : null

  async function handleAdd(payload: Parameters<typeof addTodo.mutate>[0]) {
    setFormError(null)
    try {
      await addTodo.mutateAsync(payload)
      setShowForm(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save. Check console for details.')
      console.error('[addTodo]', err)
    }
  }

  async function handleUpdate(id: string, payload: Parameters<typeof addTodo.mutate>[0]) {
    setEditError(null)
    try {
      await updateTodo.mutateAsync({ id, ...payload })
      setEditingId(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save. Check console for details.')
      console.error('[updateTodo]', err)
    }
  }

  return (
    <section>
      <SectionHeader
        title="QUESTS"
        sub={
          filterProjectId && selectedProject
            ? `[${selectedProject.title}] ${active.length} active`
            : filterArea
            ? `[${filterArea}] ${active.length} active`
            : `${active.length} active`
        }
      />

      {isLoading && (
        <div className="font-body text-body-sm text-rpg-muted p-2">Loading...</div>
      )}

      {active.length === 0 && !isLoading && (
        <PixelPanel className="mb-2">
          <p className="font-body text-body-sm text-rpg-muted">
            {filterProjectId ? 'No active quests for this project.' : 'Quest log is clear.'}
          </p>
        </PixelPanel>
      )}

      {/* Overdue label */}
      {overdue.length > 0 && (
        <div className="font-pixel text-pixel-xs text-rpg-hp mb-1">⚠ OVERDUE ({overdue.length})</div>
      )}

      {/* All active quests in a scrollable grid */}
      {active.length > 0 && (
        <div className="flex flex-col gap-1 mb-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
          {active.map((t) => editingId === t.id ? (
            <TodoForm
              key={t.id}
              userId={userId}
              projects={projects ?? []}
              initialValues={{ title: t.title, description: t.description, project_id: t.project_id, areas: t.areas, difficulty: t.difficulty, due_date: t.due_date }}
              onAdd={(payload) => handleUpdate(t.id, payload)}
              onCancel={() => { setEditingId(null); setEditError(null) }}
              isLoading={updateTodo.isPending}
              error={editError}
            />
          ) : (
            <TodoCard
              key={t.id}
              todo={t}
              project={t.project_id ? projectMap.get(t.project_id) : undefined}
              isOverdue={isOverdue(t)}
              onComplete={(todo) => completeTodo.mutate(todo)}
              onDelete={(id) => deleteTodo.mutate(id)}
              onEdit={(todo) => { setEditingId(todo.id); setShowForm(false) }}
              isCompleting={completeTodo.isPending}
            />
          ))}
        </div>
      )}

      {/* Completed toggle */}
      {completed.length > 0 && (
        <div className="mb-2">
          <PixelButton size="xs" variant="primary" onClick={() => setShowCompleted((v) => !v)}>
            {showCompleted ? '▼' : '▶'} COMPLETED ({completed.length})
          </PixelButton>
          {showCompleted && (
            <div className="flex flex-col gap-1 mt-1 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
              {completed.map((t) => (
                <TodoCard
                  key={t.id}
                  todo={t}
                  project={t.project_id ? projectMap.get(t.project_id) : undefined}
                  isOverdue={false}
                  onComplete={(todo) => completeTodo.mutate(todo)}
                  onDelete={(id) => deleteTodo.mutate(id)}
                  onEdit={(todo) => { setEditingId(todo.id); setShowForm(false) }}
                  isCompleting={completeTodo.isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showForm ? (
        <TodoForm
          userId={userId}
          projects={projects ?? []}
          defaultProjectId={filterProjectId}
          onAdd={handleAdd}
          onCancel={() => { setShowForm(false); setFormError(null) }}
          isLoading={addTodo.isPending}
          error={formError}
        />
      ) : (
        <PixelButton size="sm" variant="success" onClick={() => setShowForm(true)}>
          + ADD QUEST
        </PixelButton>
      )}
    </section>
  )
}
