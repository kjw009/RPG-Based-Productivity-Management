/**
 * Shows a full-screen HELLDIVER DOWN overlay when the player is defeated.
 */
import { useGameContext } from '../../context/GameContext'

export default function KOOverlay() {
  const { showKO, dismissKO } = useGameContext()
  if (!showKO) return null

  return (
    <div className="ko-overlay" onClick={dismissKO} role="dialog" aria-label="Helldiver Down">
      <div className="text-center" style={{ userSelect: 'none' }}>

        {/* Warning brackets */}
        <div
          className="font-pixel text-pixel-sm mb-4"
          style={{ color: '#4a6878', letterSpacing: '0.3em' }}
        >
          ⚠ CASUALTY REPORT ⚠
        </div>

        {/* Main KO text */}
        <div className="ko-text">HELLDIVER DOWN</div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6 mx-auto" style={{ maxWidth: 360 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,51,68,0.4)' }} />
          <div style={{ color: '#FF3344', fontSize: 12, fontFamily: 'Orbitron', letterSpacing: '0.2em' }}>
            ◈
          </div>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,51,68,0.4)' }} />
        </div>

        {/* Detail lines */}
        <div
          className="font-grimoire text-grimoire-lg mt-2"
          style={{ color: '#c8d8e4', textShadow: '0 0 10px rgba(255,51,68,0.3)' }}
        >
          Helldiver eliminated in action.
        </div>
        <div
          className="font-grimoire text-grimoire-base mt-2"
          style={{ color: '#4a6878' }}
        >
          All requisition slips recovered by Super Earth Command.
        </div>
        <div
          className="font-grimoire text-grimoire-sm mt-1"
          style={{ color: '#4a6878', fontStyle: 'italic' }}
        >
          Vitals restored. Democracy endures.
        </div>

        {/* Reinforce prompt */}
        <div
          className="font-pixel text-pixel-xs mt-8 animate-blink"
          style={{ color: '#FF3344', letterSpacing: '0.2em' }}
        >
          — TAP TO REQUEST REINFORCEMENT —
        </div>

        {/* Classification footer */}
        <div
          className="font-pixel text-pixel-xs mt-6"
          style={{ color: '#1a3040', letterSpacing: '0.15em' }}
        >
          SE-CASUALTY-FORM-7731-B
        </div>
      </div>
    </div>
  )
}
