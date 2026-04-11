/**
 * Display the player's XP bar, showing current XP and progress towards the next level. The bar fills up as the player gains XP from completing tasks, and resets to empty when they level up. The current XP and max XP are displayed as text on top of the bar for clarity.
 * The bar also changes color based on the player's current rank, providing a visual indicator of their progression. For example, it could start as a basic gray at low ranks and gradually shift to vibrant golds and purples at higher ranks.
 * This component is used within the PlayerPanel to give players a clear view of their XP status and motivate them to keep progressing.
 */

// Note: This component is currently unused since we don't have any level-up mechanics implemented yet, but it's ready to go once we do.
interface Props {
  xp: number
  maxXp: number
}

// The XP bar visually represents the player's current XP relative to the maximum XP needed for the next level. It fills up as the player gains XP, and resets when they level up. The current and max XP are also displayed as text for clarity. The bar's color changes based on the player's rank, providing a visual cue of their progression.
export default function XPBar({ xp, maxXp }: Props) {
  const pct = maxXp > 0 ? Math.max(0, Math.min(100, (xp / maxXp) * 100)) : 0

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="font-pixel text-pixel-xs text-rpg-xp" style={{ letterSpacing: '0.1em' }}>XP</span>
        <span className="font-pixel text-pixel-xs text-rpg-text">{xp} / {maxXp}</span>
      </div>
      <div
        className="pixel-bar-track w-full"
        style={{ height: 12 }}
        role="progressbar"
        aria-valuenow={xp}
        aria-valuemin={0}
        aria-valuemax={maxXp}
      >
        <div
          className="pixel-bar-fill pixel-bar-xp pixel-bar-segmented"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}