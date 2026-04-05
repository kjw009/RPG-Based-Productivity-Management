interface Props {
  gold: number
  compact?: boolean
}

export default function GoldCounter({ gold, compact = false }: Props) {
  if (compact) {
    return (
      <span className="flex items-center gap-1 font-pixel text-pixel-xs text-rpg-gold">
        <span>🪙</span>
        <span>{gold.toLocaleString()}</span>
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xl">🪙</span>
      <div>
        <div className="font-pixel text-pixel-xs text-rpg-muted">GOLD</div>
        <div className="font-pixel text-pixel-base text-rpg-gold">{gold.toLocaleString()}</div>
      </div>
    </div>
  )
}
