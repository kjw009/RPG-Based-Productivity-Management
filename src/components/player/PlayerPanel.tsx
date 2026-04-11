import HPBar from './HPBar'
import ManaBar from './ManaBar'
import XPBar from './XPBar'
import GoldCounter from './GoldCounter'
import PixelAvatar from './PixelAvatar'
import type { Player } from '../../types'

interface Props {
  player: Player
  compact?: boolean
  /** Sign out and return to the login screen. */
  onSignOut?: () => Promise<void>
}

export default function PlayerPanel({ player, compact = false, onSignOut }: Props) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 px-3 py-2" style={{
        background: 'linear-gradient(180deg, #0d1a24 0%, #070e14 100%)',
        borderBottom: '1px solid #1a3040',
      }}>
        <span className="font-pixel text-pixel-xs text-rpg-gold truncate max-w-[90px]">
          {player.name}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 items-center">
            <div className="flex-1"><HPBar hp={player.hp} maxHp={player.max_hp} /></div>
            <div className="flex-1"><ManaBar mana={player.mana} maxMana={player.max_mana} /></div>
            <div className="flex-1"><XPBar xp={player.xp} maxXp={player.max_xp} /></div>
          </div>
        </div>
        <GoldCounter gold={player.gold} compact />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Avatar + identity */}
      <div
        className="flex flex-col items-center gap-2 pb-3"
        style={{ borderBottom: '1px solid #1a3040' }}
      >
        <div className="animate-idle-bob">
          <PixelAvatar />
        </div>
        <div className="text-center">
          <div
            className="font-pixel text-pixel-base text-rpg-gold"
            style={{ letterSpacing: '0.1em', textShadow: '0 0 10px rgba(255,231,16,0.3)' }}
          >
            {player.name}
          </div>
          <div
            className="font-grimoire text-grimoire-sm mt-1"
            style={{ color: '#2d5a7a', letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            {player.rank_title}
          </div>
        </div>
      </div>

      {/* Tactical stats */}
      <HPBar hp={player.hp} maxHp={player.max_hp} />
      <ManaBar mana={player.mana} maxMana={player.max_mana} showReset />
      <XPBar xp={player.xp} maxXp={player.max_xp} />

      {/* Requisition slips */}
      <div className="pt-2" style={{ borderTop: '1px solid #1a3040' }}>
        <GoldCounter gold={player.gold} />
      </div>

      {/* Sign out */}
      {onSignOut && (
        <div className="pt-2" style={{ borderTop: '1px solid #1a3040' }}>
          <button
            className="font-pixel text-pixel-xs w-full text-center transition-colors"
            style={{ color: '#2d5a7a', letterSpacing: '0.1em' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FF3344' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#2d5a7a' }}
            onClick={onSignOut}
          >
            DISCONNECT
          </button>
        </div>
      )}
    </div>
  )
}
