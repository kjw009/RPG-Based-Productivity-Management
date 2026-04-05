import { useState } from 'react'
import SectionHeader from '../shared/SectionHeader'
import PixelPanel from '../shared/PixelPanel'
import PixelButton from '../shared/PixelButton'
import DailyTaskCard from './DailyTaskCard'
import AddDailyForm from './AddDailyForm'
import { useDailies } from '../../hooks/useDailies'

interface Props { userId: string }

export default function DailyTaskList({ userId }: Props) {
  const [showForm, setShowForm] = useState(false)
  const { todaysTasks, isLoading, completeTask, addTask, deleteTask } = useDailies(userId)

  const completed = todaysTasks.filter(
    (t) => t.last_completed_date === new Date().toISOString().split('T')[0]
  ).length

  return (
    <section>
      <SectionHeader title="DAILY TASKS" sub={`${completed}/${todaysTasks.length}`} />

      {isLoading && (
        <div className="font-body text-body-base text-rpg-muted p-4">Loading quests...</div>
      )}

      {!isLoading && todaysTasks.length === 0 && (
        <PixelPanel className="mb-2">
          <p className="font-body text-body-base text-rpg-muted">
            No daily tasks scheduled for today. Add one below!
          </p>
        </PixelPanel>
      )}

      <div className="flex flex-col gap-2 mb-3">
        {todaysTasks.map((task) => (
          <DailyTaskCard
            key={task.id}
            task={task}
            onComplete={(t) => completeTask.mutate(t)}
            onDelete={(id) => deleteTask.mutate(id)}
            isCompleting={completeTask.isPending}
          />
        ))}
      </div>

      {showForm ? (
        <AddDailyForm
          onAdd={(payload) => {
            addTask.mutate(payload)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
          isLoading={addTask.isPending}
        />
      ) : (
        <PixelButton size="sm" variant="success" onClick={() => setShowForm(true)}>
          + ADD DAILY
        </PixelButton>
      )}
    </section>
  )
}
