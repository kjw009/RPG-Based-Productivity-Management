import SectionHeader from '../shared/SectionHeader'
import AbilityCard from './AbilityCard'
import { useAbilities } from '../../hooks/useAbilities'
import { useTodos } from '../../hooks/useTodos'

interface Props { userId: string }

export default function AbilityGrid({ userId }: Props) {
  const { abilitiesQuery, effectsQuery, isArmed, canActivate, activateAbility } = useAbilities(userId)
  const { data: todos } = useTodos(userId)

  const abilities = abilitiesQuery.data ?? []
  const effects = effectsQuery.data ?? []
  const incompleteTodos = (todos ?? []).filter((t) => !t.completed)

  return (
    <section>
      <SectionHeader title="ABILITIES" />
      {abilitiesQuery.isLoading && (
        <div className="font-body text-body-base text-rpg-muted p-2">Loading...</div>
      )}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
      >
        {abilities.map((ability) => (
          <AbilityCard
            key={ability.id}
            ability={ability}
            activeEffects={effects}
            canActivate={canActivate(ability)}
            incompleteTodos={incompleteTodos}
            onActivate={(ab, todoId) => activateAbility.mutate({ ability: ab, targetTodoId: todoId })}
            isPending={activateAbility.isPending}
          />
        ))}
      </div>
    </section>
  )
}
