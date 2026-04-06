interface Props {
  gold: number
  compact?: boolean
}

export default function GoldCounter({ gold, compact = false }: Props) {
  if (compact) {
    return (
      <span className="flex items-center gap-1 font-grimoire text-grimoire-sm text-rpg-gold">
        <span>🪙</span>
        <span>{gold.toLocaleString()}</span>
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xl">🪙</span>
      <div>
        <div className="font-grimoire text-grimoire-sm text-rpg-muted">Gold</div>
        <div className="font-grimoire text-grimoire-lg text-rpg-gold">{gold.toLocaleString()}</div>
      </div>
    </div>
  )
}
