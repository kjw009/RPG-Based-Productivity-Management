import { daysUntilNextMonday } from '../../lib/gameRules'

interface Props {
  mana: number
  maxMana: number
  showReset?: boolean
}

export default function ManaBar({ mana, maxMana, showReset = false }: Props) {
  const pct = maxMana > 0 ? Math.max(0, Math.min(100, (mana / maxMana) * 100)) : 0

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="font-pixel text-pixel-xs text-rpg-mana">MP</span>
        <span className="font-pixel text-pixel-xs text-rpg-text">{mana} / {maxMana}</span>
      </div>
      <div
        className="pixel-bar-track w-full"
        style={{ height: 14 }}
        role="progressbar"
        aria-valuenow={mana}
        aria-valuemin={0}
        aria-valuemax={maxMana}
      >
        <div
          className="pixel-bar-fill pixel-bar-mana pixel-bar-segmented"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showReset && (
        <div className="font-body text-body-sm text-rpg-muted mt-1">
          Resets in {daysUntilNextMonday()}d
        </div>
      )}
    </div>
  )
}
