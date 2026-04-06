interface Props {
  streak: number
  size?: 'sm' | 'md'
}

export default function StreakCounter({ streak, size = 'md' }: Props) {
  const textClass = size === 'sm' ? 'text-grimoire-sm' : 'text-grimoire-base'
  return (
    <span className={`flex items-center gap-1 font-grimoire ${textClass}`}>
      <span title="Streak" className="animate-flame-flicker">🔥</span>
      <span className="ink-gold font-bold">{streak}</span>
    </span>
  )
}
