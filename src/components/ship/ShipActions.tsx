import ShipActionButton from './ShipActionButton'
import type { ActionDef } from './ShipActionButton'
import { useShipActions } from '../../hooks/useShipActions'
import SectionHeader from '../shared/SectionHeader'

const MS_PER_DAY = 86_400_000

const ACTIONS: ActionDef[] = [
  {
    id: 'resupply',
    label: ['RESUPPLY'],
    cooldownMs: 1 * MS_PER_DAY,
    color: '#FFE710',
    dimColor: '#3a3600',
  },
  {
    id: 'eagle_rearm',
    label: ['EAGLE', 'REARM'],
    cooldownMs: 3 * MS_PER_DAY,
    color: '#7DF9FF',
    dimColor: '#0a2a2a',
  },
  {
    id: 'charge_orbital',
    label: ['CHARGE', 'ORBITAL'],
    cooldownMs: 7 * MS_PER_DAY,
    color: '#41639C',
    dimColor: '#0a1020',
  },
]

interface Props {
  userId: string
}

export default function ShipActions({ userId }: Props) {
  const { data: records, activateAction } = useShipActions(userId)

  return (
    <section>
      <SectionHeader title="SHIP" />
      <div className="flex justify-around items-center">
        {ACTIONS.map((action) => {
          const record = (records ?? []).find((r) => r.action_id === action.id)
          return (
            <ShipActionButton
              key={action.id}
              action={action}
              activatedAt={record?.activated_at ?? null}
              onActivate={() => activateAction.mutate(action.id)}
              isPending={activateAction.isPending}
            />
          )
        })}
      </div>
    </section>
  )
}
