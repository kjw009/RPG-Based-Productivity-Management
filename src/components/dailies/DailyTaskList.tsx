import { useState } from 'react'
import SectionHeader from '../shared/SectionHeader'
import PixelPanel from '../shared/PixelPanel'
import PixelButton from '../shared/PixelButton'
import DailyTaskCard from './DailyTaskCard'
import AddDailyForm from './AddDailyForm'
import { useDailies } from '../../hooks/useDailies'
import { todayStr } from '../../lib/gameRules'

interface Props { userId: string }

export default function DailyTaskList({ userId }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const { todaysTasks, isLoading, completeTask, addTask, deleteTask, updateTask } = useDailies(userId)

  const today = todayStr()
  const completed = todaysTasks.filter((t) => t.last_completed_date === today).length

  async function handleAdd(payload: Parameters<typeof addTask.mutate>[0]) {
    setFormError(null)
    try {
      await addTask.mutateAsync(payload)
      setShowForm(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save. Check console for details.')
      console.error('[addTask]', err)
    }
  }

  async function handleUpdate(id: string, payload: Parameters<typeof addTask.mutate>[0]) {
    setEditError(null)
    try {
      await updateTask.mutateAsync({ id, ...payload })
      setEditingId(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save. Check console for details.')
      console.error('[updateTask]', err)
    }
  }

  return (
    <section>
      <SectionHeader title="DAILY TASKS" sub={`${completed}/${todaysTasks.length}`} />

      {isLoading && (
        <div className="font-body text-body-base text-rpg-muted p-4">Loading quests...</div>
      )}

      {!isLoading && todaysTasks.length === 0 && !showForm && (
        <PixelPanel className="mb-2">
          <p className="font-body text-body-base text-rpg-muted">
            No daily tasks scheduled for today. Add one below!
          </p>
        </PixelPanel>
      )}

      <div className="flex flex-col gap-2 mb-3">
        {todaysTasks.map((task) => editingId === task.id ? (
          <AddDailyForm
            key={task.id}
            userId={userId}
            initialValues={{ title: task.title, recurrence_days: task.recurrence_days, difficulty: task.difficulty, areas: task.areas }}
            onAdd={(payload) => handleUpdate(task.id, payload)}
            onCancel={() => { setEditingId(null); setEditError(null) }}
            isLoading={updateTask.isPending}
            error={editError}
          />
        ) : (
          <DailyTaskCard
            key={task.id}
            task={task}
            onComplete={(t) => completeTask.mutate(t)}
            onDelete={(id) => deleteTask.mutate(id)}
            onEdit={(t) => { setEditingId(t.id); setShowForm(false) }}
            isCompleting={completeTask.isPending}
          />
        ))}
      </div>

      {showForm ? (
        <AddDailyForm
          userId={userId}
          onAdd={handleAdd}
          onCancel={() => { setShowForm(false); setFormError(null) }}
          isLoading={addTask.isPending}
          error={formError}
        />
      ) : (
        <PixelButton size="sm" variant="success" onClick={() => setShowForm(true)}>
          + ADD DAILY
        </PixelButton>
      )}
    </section>
  )
}
