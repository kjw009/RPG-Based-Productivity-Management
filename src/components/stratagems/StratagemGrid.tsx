/**
 * Grid layout for stratagem cards, used to display the player's active and available stratagems.
 */
import SectionHeader from '../shared/SectionHeader'
import StratagemCard from './StratagemCard'
import { useStratagems } from '../../hooks/useStratagems'
import { useTodos } from '../../hooks/useTodos'

interface Props { userId: string }

export default function StratagemGrid({ userId }: Props) {
  const { stratagemQuery, effectsQuery, canActivate, activateStratagem } = useStratagems(userId)
  const { data: todos } = useTodos(userId)

  const stratagems = stratagemQuery.data ?? []
  const effects = effectsQuery.data ?? []
  const incompleteTodos = (todos ?? []).filter((t) => !t.completed)

  return (
    <section>
      <SectionHeader title="STRATAGEMS" />
      {stratagemQuery.isLoading && (
        <div className="font-grimoire text-grimoire-sm text-rpg-muted p-2">Loading...</div>
      )}
      <div className="flex flex-col gap-1 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin">
        {stratagems.map((stratagem) => (
          <StratagemCard
            key={stratagem.id}
            stratagem={stratagem}
            activeEffects={effects}
            canActivate={canActivate(stratagem)}
            incompleteTodos={incompleteTodos}
            onActivate={(stratagem, todoId) => activateStratagem.mutate({ stratagem, targetTodoId: todoId })}
            isPending={activateStratagem.isPending}
          />
        ))}
      </div>
    </section>
  )
}
