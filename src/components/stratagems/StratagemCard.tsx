import { useState } from 'react'
import PixelButton from '../shared/PixelButton'
import { getAbilityIcon } from './StratagemIcons'
import type { Stratagem, ActiveEffect, Todo } from '../../types'
import { isEffectActive } from '../../lib/gameRules'

interface Props {
  stratagem: Stratagem
  activeEffects: ActiveEffect[]
  canActivate: boolean
  incompleteTodos: Todo[]
  onActivate: (stratagem: Stratagem, targetTodoId?: string) => void
  isPending: boolean
}

export default function StratagemCard({
  stratagem,
  activeEffects,
  canActivate,
  incompleteTodos,
  onActivate,
  isPending,
}: Props) {
  const [selectedTodo, setSelectedTodo] = useState('')
  const [showTodoPicker, setShowTodoPicker] = useState(false)

  const armed = activeEffects.some(
    (e) => e.effect_type === stratagem.effect_type && isEffectActive(e.expires_at)
  )

  function handleActivate() {
    if (stratagem.effect_type === 'shadow_step') {
      setShowTodoPicker(true)
    } else {
      onActivate(stratagem)
    }
  }

  function confirmShadowStep() {
    if (!selectedTodo) return
    onActivate(stratagem, selectedTodo)
    setShowTodoPicker(false)
    setSelectedTodo('')
  }

  return (
    <div className={`inventory-slot px-2 py-1.5 ${armed ? 'armed-glow' : ''}`}>
      {/* Single row: icon + name + mana + activate */}
      <div className="flex items-center gap-1.5">
        <div className="flex-shrink-0 animate-rune-glow">{getAbilityIcon(stratagem.effect_type)}</div>
        <div className="flex-1 min-w-0">
          <div className="font-grimoire text-grimoire-base ink-text leading-tight font-bold truncate">
            {stratagem.name}
          </div>
          <div className="font-grimoire text-grimoire-sm ink-mana">{stratagem.mana_cost} SP</div>
        </div>
        {armed ? (
          <span className="font-grimoire text-grimoire-sm ink-gold animate-blink font-bold flex-shrink-0">Armed</span>
        ) : !showTodoPicker ? (
          <PixelButton
            size="xs"
            variant={canActivate ? 'purple' : 'primary'}
            onClick={handleActivate}
            disabled={!canActivate || isPending || armed}
          >
            {isPending ? '...' : 'Cast'}
          </PixelButton>
        ) : null}
      </div>

      {/* Description */}
      <div className="font-grimoire text-grimoire-sm ink-muted italic mt-1">
        {stratagem.description}
      </div>

      {/* Shadow step todo picker (expands below when needed) */}
      {showTodoPicker && (
        <div className="flex flex-col gap-1.5 mt-1.5">
          <select
            className="pixel-select text-sm"
            value={selectedTodo}
            onChange={(e) => setSelectedTodo(e.target.value)}
          >
            <option value="">-- select mission --</option>
            {incompleteTodos.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <div className="flex gap-1">
            <PixelButton size="xs" variant="success" onClick={confirmShadowStep} disabled={!selectedTodo}>
              Confirm
            </PixelButton>
            <PixelButton size="xs" variant="danger" onClick={() => setShowTodoPicker(false)}>
              Cancel
            </PixelButton>
          </div>
        </div>
      )}
    </div>
  )
}
