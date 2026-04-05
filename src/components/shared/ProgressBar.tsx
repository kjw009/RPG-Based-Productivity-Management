interface Props {
  value: number      // 0–100
  variant?: 'hp' | 'mana' | 'xp' | 'gold'
  height?: number
  segmented?: boolean
  label?: string
}

export default function ProgressBar({
  value,
  variant = 'xp',
  height = 14,
  segmented = false,
  label,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className="w-full">
      {label && (
        <div className="font-pixel text-pixel-xs text-rpg-muted mb-1">{label}</div>
      )}
      <div
        className="pixel-bar-track w-full"
        style={{ height }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`pixel-bar-fill pixel-bar-${variant} ${segmented ? 'pixel-bar-segmented' : ''}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
