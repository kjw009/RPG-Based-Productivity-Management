import { useState } from 'react'
import SectionHeader from '../shared/SectionHeader'
import PixelButton from '../shared/PixelButton'
import PixelPanel from '../shared/PixelPanel'
import HabitCard from './HabitCard'
import HabitForm from './HabitForm'
import { useHabits } from '../../hooks/useHabits'

interface Props { userId: string }

export default function HabitSection({ userId }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { habitsQuery, consistencyPct, logHabit, addHabit, deleteHabit } = useHabits(userId)

  const habits = habitsQuery.data ?? []

  async function handleAdd(payload: Parameters<typeof addHabit.mutate>[0]) {
    setFormError(null)
    try {
      await addHabit.mutateAsync(payload)
      setShowForm(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save. Check console for details.')
      console.error('[addHabit]', err)
    }
  }

  return (
    <section>
      <SectionHeader title="HABITS" sub={`${habits.length}`} />

      {habitsQuery.isLoading && <div className="font-body text-body-base text-rpg-muted p-2">Loading...</div>}

      {habits.length === 0 && !habitsQuery.isLoading && (
        <PixelPanel className="mb-3">
          <p className="font-body text-body-base text-rpg-muted">No habits tracked yet.</p>
        </PixelPanel>
      )}

      <div className="flex flex-col gap-2 mb-3">
        {habits.map((h) => (
          <HabitCard
            key={h.id}
            habit={h}
            consistencyPct={consistencyPct(h.id)}
            onLog={(habit, direction) => logHabit.mutate({ habit, direction })}
            onDelete={(id) => deleteHabit.mutate(id)}
            isLogging={logHabit.isPending}
          />
        ))}
      </div>

      {showForm ? (
        <HabitForm
          userId={userId}
          onAdd={handleAdd}
          onCancel={() => { setShowForm(false); setFormError(null) }}
          isLoading={addHabit.isPending}
          error={formError}
        />
      ) : (
        <PixelButton size="sm" variant="success" onClick={() => setShowForm(true)}>
          + ADD HABIT
        </PixelButton>
      )}
    </section>
  )
}
