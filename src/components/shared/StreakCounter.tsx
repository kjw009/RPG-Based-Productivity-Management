interface Props {
  streak: number
  size?: 'sm' | 'md'
}

export default function StreakCounter({ streak, size = 'md' }: Props) {
  const textClass = size === 'sm' ? 'text-pixel-xs' : 'text-pixel-sm'
  return (
    <span className={`flex items-center gap-1 font-pixel ${textClass}`}>
      <span title="Streak">🔥</span>
      <span className="text-rpg-gold">{streak}</span>
    </span>
  )
}
