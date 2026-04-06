import { useState } from 'react'
import PixelPanel from '../shared/PixelPanel'
import PixelButton from '../shared/PixelButton'
import TodoForm from '../todos/TodoForm'
import AddDailyForm from '../dailies/AddDailyForm'
import HabitForm from '../habits/HabitForm'
import ProjectForm from '../projects/ProjectForm'
import { useTodos } from '../../hooks/useTodos'
import { useDailies } from '../../hooks/useDailies'
import { useHabits } from '../../hooks/useHabits'
import { useProjects } from '../../hooks/useProjects'
import { useInbox } from '../../hooks/useInbox'
import type { InboxItem } from '../../types'

type ConvertMode = 'todo' | 'daily' | 'habit' | 'project'

interface Props {
  item: InboxItem
  userId: string
  onDone: () => void
}

export default function ProcessInboxItem({ item, userId, onDone }: Props) {
  const [mode, setMode] = useState<ConvertMode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  const { addTodo } = useTodos(userId)
  const { addTask } = useDailies(userId)
  const { addHabit } = useHabits(userId)
  const { addProject, data: projects } = useProjects(userId)
  const { deleteItem } = useInbox(userId)

  // Creates the target entity then deletes the inbox item atomically from the user's POV.
  async function convert(createFn: () => Promise<void>) {
    setError(null)
    setIsConverting(true)
    try {
      await createFn()
      await deleteItem.mutateAsync(item.id)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed.')
      setIsConverting(false)
    }
  }

  // When a form is active, render it directly (it has its own PixelPanel).
  if (mode === 'todo') {
    return (
      <TodoForm
        userId={userId}
        projects={projects ?? []}
        label="→ QUEST"
        initialValues={{ title: item.content, description: '', project_id: null, areas: [], difficulty: 1, due_date: null }}
        onAdd={(payload) => convert(() => addTodo.mutateAsync(payload))}
        onCancel={() => { setMode(null); setError(null) }}
        isLoading={isConverting}
        error={error}
      />
    )
  }

  if (mode === 'daily') {
    return (
      <AddDailyForm
        userId={userId}
        label="→ DAILY"
        initialValues={{ title: item.content, recurrence_days: [1, 2, 3, 4, 5], difficulty: 1, areas: [] }}
        onAdd={(payload) => convert(() => addTask.mutateAsync(payload))}
        onCancel={() => { setMode(null); setError(null) }}
        isLoading={isConverting}
        error={error}
      />
    )
  }

  if (mode === 'habit') {
    return (
      <HabitForm
        userId={userId}
        label="→ HABIT"
        initialValues={{ title: item.content, type: 'good', difficulty: 1, areas: [] }}
        onAdd={(payload) => convert(() => addHabit.mutateAsync(payload))}
        onCancel={() => { setMode(null); setError(null) }}
        isLoading={isConverting}
        error={error}
      />
    )
  }

  if (mode === 'project') {
    return (
      <ProjectForm
        userId={userId}
        label="→ PROJECT"
        initialValues={{ title: item.content, description: '', areas: [] }}
        onAdd={(payload) => convert(() => addProject.mutateAsync(payload))}
        onCancel={() => { setMode(null); setError(null) }}
        isLoading={isConverting}
        error={error}
      />
    )
  }

  // Mode selection panel
  return (
    <PixelPanel variant="gold">
      <div className="font-grimoire text-grimoire-sm ink-muted mb-3 truncate italic">
        ▶ &ldquo;{item.content}&rdquo;
      </div>
      <div className="font-grimoire text-grimoire-sm ink-gold mb-2 font-bold">Convert to:</div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <PixelButton variant="gold"    size="sm" onClick={() => setMode('todo')}>⚔ Quest</PixelButton>
        <PixelButton variant="primary" size="sm" onClick={() => setMode('daily')}>☀ Daily</PixelButton>
        <PixelButton variant="success" size="sm" onClick={() => setMode('habit')}>♦ Habit</PixelButton>
        <PixelButton variant="purple"  size="sm" onClick={() => setMode('project')}>📜 Project</PixelButton>
      </div>
      <PixelButton variant="danger" size="sm" onClick={onDone}>Cancel</PixelButton>
    </PixelPanel>
  )
}
