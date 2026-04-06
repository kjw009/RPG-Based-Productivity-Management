interface Props {
  name: string
  color: string
  onRemove?: () => void
}

// A small coloured pill that displays an area tag.
// Pass onRemove to show an × button (used in management views).
export default function AreaTag({ name, color, onRemove }: Props) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 font-pixel text-pixel-xs"
      style={{
        backgroundColor: color + '22', // 13% opacity background
        border: `2px solid ${color}`,
        color,
        imageRendering: 'pixelated',
      }}
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 opacity-70 hover:opacity-100 leading-none"
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
