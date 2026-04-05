import { useGameContext } from '../../context/GameContext'

export default function KOOverlay() {
  const { showKO, dismissKO } = useGameContext()
  if (!showKO) return null

  return (
    <div className="ko-overlay" onClick={dismissKO} role="dialog" aria-label="KO!">
      <div className="text-center">
        <div className="ko-text">KO!</div>
        <div className="font-pixel text-pixel-base text-white mt-6" style={{ textShadow: '2px 2px 0 #000' }}>
          YOU HAVE FALLEN
        </div>
        <div className="font-body text-body-lg text-red-300 mt-2">
          All gold lost. HP restored.
        </div>
        <div className="font-pixel text-pixel-xs text-red-400 mt-6 animate-blink">
          TAP TO CONTINUE
        </div>
      </div>
    </div>
  )
}
