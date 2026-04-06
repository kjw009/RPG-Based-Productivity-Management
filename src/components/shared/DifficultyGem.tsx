/**
 * Visual badge representing task difficulty with a color-coded gem.
 */
interface Props {
  difficulty: number
  showAll?: boolean
}

const LABELS = ['', 'F', 'D', 'C', 'B', 'S']

export default function DifficultyGem({ difficulty, showAll = false }: Props) {
  if (showAll) {
    return (
      <span className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`gem gem-${n} ${n > difficulty ? 'opacity-20' : ''}`}
            title={`Difficulty ${n}`}
          />
        ))}
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1" title={`Difficulty ${difficulty}`}>
      <span className={`gem gem-${difficulty}`} />
      <span className="font-grimoire text-grimoire-sm ink-muted">{LABELS[difficulty]}</span>
    </span>
  )
}
