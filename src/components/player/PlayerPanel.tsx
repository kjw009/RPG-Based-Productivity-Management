import HPBar from './HPBar'
import ManaBar from './ManaBar'
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
        background: 'linear-gradient(180deg, #3a2010 0%, #2a1508 100%)',
        borderBottom: '2px solid #5a3820',
      }}>
        <span className="font-grimoire text-grimoire-sm text-rpg-gold truncate max-w-[90px]">
          {player.name}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 items-center">
            <div className="flex-1"><HPBar hp={player.hp} maxHp={player.max_hp} /></div>
            <div className="flex-1"><ManaBar mana={player.mana} maxMana={player.max_mana} /></div>
          </div>
        </div>
        <GoldCounter gold={player.gold} compact />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Avatar + identity */}
      <div className="flex flex-col items-center gap-2 pb-3 border-b border-rpg-gold/20">
        <div className="animate-idle-bob">
          <PixelAvatar />
        </div>
        <div className="text-center">
          <div className="font-grimoire text-grimoire-lg text-rpg-gold" style={{
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}>
            {player.name}
          </div>
          <div className="font-grimoire text-grimoire-sm text-rpg-gold/60 italic">
            {player.rank_title}
          </div>
        </div>
      </div>

      {/* Stats */}
      <HPBar hp={player.hp} maxHp={player.max_hp} />
      <ManaBar mana={player.mana} maxMana={player.max_mana} showReset />

      {/* Gold */}
      <div className="border-t border-rpg-gold/20 pt-3">
        <GoldCounter gold={player.gold} />
        <div className="mt-2 flex items-center gap-2">
          <span className="font-grimoire text-grimoire-sm text-rpg-muted">Lifetime</span>
          <span className="font-grimoire text-grimoire-sm text-rpg-gold">
            {player.lifetime_gold.toLocaleString()} G
          </span>
        </div>
      </div>

      {/* Account controls */}
      {onSignOut && (
        <div className="border-t border-rpg-gold/20 pt-3">
          <button
            className="font-grimoire text-grimoire-sm text-rpg-muted hover:text-rpg-hp transition-colors w-full text-center"
            onClick={onSignOut}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
