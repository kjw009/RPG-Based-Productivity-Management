import { useState } from 'react'
import PixelButton from '../shared/PixelButton'
import type { Ability, ActiveEffect, Todo } from '../../types'
import { isEffectActive } from '../../lib/gameRules'

const ABILITY_ICONS: Record<string, string> = {
  pickpocket:  '🪙',
  shadow_step: '👤',
  smoke_bomb:  '💨',
  backstab:    '🗡️',
}

interface Props {
  ability: Ability
  activeEffects: ActiveEffect[]
  canActivate: boolean
  incompleteTodos: Todo[]
  onActivate: (ability: Ability, targetTodoId?: string) => void
  isPending: boolean
}

export default function AbilityCard({
  ability,
  activeEffects,
  canActivate,
  incompleteTodos,
  onActivate,
  isPending,
}: Props) {
  const [selectedTodo, setSelectedTodo] = useState('')
  const [showTodoPicker, setShowTodoPicker] = useState(false)

  const armed = activeEffects.some(
    (e) => e.effect_type === ability.effect_type && isEffectActive(e.expires_at)
  )

  const icon = ABILITY_ICONS[ability.effect_type] ?? '✨'

  function handleActivate() {
    if (ability.effect_type === 'shadow_step') {
      setShowTodoPicker(true)
    } else {
      onActivate(ability)
    }
  }

  function confirmShadowStep() {
    if (!selectedTodo) return
    onActivate(ability, selectedTodo)
    setShowTodoPicker(false)
    setSelectedTodo('')
  }

  return (
    <div className={`inventory-slot p-3 flex flex-col gap-2 ${armed ? 'armed-glow' : ''}`}>
      <div className="flex items-start gap-2">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="font-pixel text-pixel-xs text-rpg-text leading-relaxed">
            {ability.name}
          </div>
          <div className="font-pixel text-pixel-xs text-rpg-mana mt-0.5">
            {ability.mana_cost} MP
          </div>
        </div>
      </div>

      <div className="font-body text-body-sm text-rpg-muted">
        {ability.description}
      </div>

      {armed && (
        <div className="font-pixel text-pixel-xs text-rpg-gold animate-blink">
          ▶ ARMED
        </div>
      )}

      {/* Shadow step todo picker */}
      {showTodoPicker && (
        <div className="flex flex-col gap-2">
          <div className="font-pixel text-pixel-xs text-rpg-muted">PICK QUEST:</div>
          <select
            className="pixel-select text-sm"
            value={selectedTodo}
            onChange={(e) => setSelectedTodo(e.target.value)}
          >
            <option value="">-- select quest --</option>
            {incompleteTodos.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <div className="flex gap-1">
            <PixelButton size="xs" variant="success" onClick={confirmShadowStep} disabled={!selectedTodo}>
              CONFIRM
            </PixelButton>
            <PixelButton size="xs" variant="danger" onClick={() => setShowTodoPicker(false)}>
              CANCEL
            </PixelButton>
          </div>
        </div>
      )}

      {!showTodoPicker && (
        <PixelButton
          size="xs"
          variant={canActivate ? 'purple' : 'primary'}
          onClick={handleActivate}
          disabled={!canActivate || isPending || armed}
          title={!canActivate ? 'Not enough mana' : armed ? 'Already armed' : ''}
        >
          {isPending ? '...' : armed ? 'ARMED' : 'ACTIVATE'}
        </PixelButton>
      )}
    </div>
  )
}
