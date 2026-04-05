import { useState } from 'react'
import SectionHeader from '../shared/SectionHeader'
import PixelButton from '../shared/PixelButton'
import HabitCard from './HabitCard'
import HabitForm from './HabitForm'
import { useHabits } from '../../hooks/useHabits'
import type { Habit } from '../../types'

interface Props { userId: string }

export default function HabitSection({ userId }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'good' | 'bad'>('good')
  const { habitsQuery, consistencyPct, logHabit, addHabit, deleteHabit } = useHabits(userId)

  const habits = habitsQuery.data ?? []
  const goodHabits = habits.filter((h) => h.type === 'good')
  const badHabits = habits.filter((h) => h.type === 'bad')

  function openForm(type: 'good' | 'bad') {
    setFormType(type)
    setShowForm(true)
  }

  function HabitColumn({ type, list }: { type: 'good' | 'bad'; list: Habit[] }) {
    const isGood = type === 'good'
    return (
      <div className="flex-1 min-w-0">
        <div className={`font-pixel text-pixel-xs mb-2 ${isGood ? 'text-rpg-green' : 'text-rpg-hp'}`}>
          {isGood ? '▲ GOOD HABITS' : '▼ BAD HABITS'}
        </div>
        <div className="flex flex-col gap-2 mb-2">
          {list.length === 0 && (
            <p className="font-body text-body-sm text-rpg-muted">None tracked yet.</p>
          )}
          {list.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              consistencyPct={consistencyPct(h.id)}
              onLog={(habit) => logHabit.mutate(habit)}
              onDelete={(id) => deleteHabit.mutate(id)}
              isLogging={logHabit.isPending}
            />
          ))}
        </div>
        <PixelButton
          size="sm"
          variant={isGood ? 'success' : 'danger'}
          onClick={() => openForm(type)}
        >
          + ADD {type.toUpperCase()}
        </PixelButton>
      </div>
    )
  }

  return (
    <section>
      <SectionHeader title="HABITS" />
      {habitsQuery.isLoading && (
        <div className="font-body text-body-base text-rpg-muted p-2">Loading...</div>
      )}
      <div className="flex gap-4 flex-wrap">
        <HabitColumn type="good" list={goodHabits} />
        <HabitColumn type="bad" list={badHabits} />
      </div>
      {showForm && (
        <div className="mt-3">
          <HabitForm
            onAdd={(payload) => { addHabit.mutate(payload); setShowForm(false) }}
            onCancel={() => setShowForm(false)}
            isLoading={addHabit.isPending}
            defaultType={formType}
          />
        </div>
      )}
    </section>
  )
}
