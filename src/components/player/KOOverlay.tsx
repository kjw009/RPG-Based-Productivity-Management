/**
 * Shows a full-screen knockout overlay when the player is defeated.
 */
import { useGameContext } from '../../context/GameContext'

export default function KOOverlay() {
  const { showKO, dismissKO } = useGameContext()
  if (!showKO) return null

  return (
    <div className="ko-overlay" onClick={dismissKO} role="dialog" aria-label="KO!">
      <div className="text-center">
        <div className="ko-text">Fallen</div>
        <div className="font-grimoire text-grimoire-lg text-white mt-6" style={{ textShadow: '2px 2px 0 #000' }}>
          Your body crumbles to dust...
        </div>
        <div className="font-grimoire text-grimoire-base text-red-300 mt-2 italic">
          All gold lost. HP restored by mercy.
        </div>
        <div className="font-grimoire text-grimoire-sm text-red-400 mt-6 animate-blink">
          — Tap to Rise Again —
        </div>
      </div>
    </div>
  )
}
