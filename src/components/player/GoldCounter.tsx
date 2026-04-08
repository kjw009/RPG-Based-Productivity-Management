/**
 * Displays the player's requisition slips (gold) in compact or full format.
 */
interface Props {
  gold: number
  compact?: boolean
}

export default function GoldCounter({ gold, compact = false }: Props) {
  if (compact) {
    return (
      <span
        className="flex items-center gap-1 font-pixel text-pixel-xs text-rpg-gold"
        style={{ letterSpacing: '0.05em' }}
      >
        <span style={{ fontSize: 10 }}>◈</span>
        <span>{gold.toLocaleString()}</span>
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div
        style={{
          width: 28,
          height: 28,
          background: 'linear-gradient(135deg, #1c1800, #2a2200)',
          border: '1px solid #6a5a00',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 14,
          color: '#FFE710',
          textShadow: '0 0 8px rgba(255,231,16,0.6)',
        }}
      >
        ◈
      </div>
      <div>
        <div
          className="font-pixel text-pixel-xs"
          style={{ color: '#2d5a7a', letterSpacing: '0.15em' }}
        >
          REQUISITION
        </div>
        <div
          className="font-pixel text-pixel-sm text-rpg-gold"
          style={{ textShadow: '0 0 8px rgba(255,231,16,0.3)' }}
        >
          {gold.toLocaleString()} RS
        </div>
      </div>
    </div>
  )
}
