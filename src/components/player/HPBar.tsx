interface Props {
  hp: number
  maxHp: number
}

export default function HPBar({ hp, maxHp }: Props) {
  const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0
  const isLow = pct <= 25

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="font-grimoire text-grimoire-sm text-rpg-hp">HP</span>
        <span className={`font-grimoire text-grimoire-sm ${isLow ? 'text-rpg-hp animate-blink' : 'text-rpg-text'}`}>
          {hp} / {maxHp}
        </span>
      </div>
      <div
        className="pixel-bar-track w-full"
        style={{ height: 12 }}
        role="progressbar"
        aria-valuenow={hp}
        aria-valuemin={0}
        aria-valuemax={maxHp}
      >
        <div
          className="pixel-bar-fill pixel-bar-hp pixel-bar-segmented"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
