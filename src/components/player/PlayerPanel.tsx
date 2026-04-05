import PixelPanel from '../shared/PixelPanel'
import HPBar from './HPBar'
import ManaBar from './ManaBar'
import GoldCounter from './GoldCounter'
import PixelAvatar from './PixelAvatar'
import type { Player } from '../../types'

interface Props {
  player: Player
  compact?: boolean  // mobile top bar mode
}

export default function PlayerPanel({ player, compact = false }: Props) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-rpg-surface border-b-2 border-rpg-border">
        <span className="font-pixel text-pixel-xs text-rpg-text truncate max-w-[90px]">
          {player.name}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <HPBar hp={player.hp} maxHp={player.max_hp} />
            </div>
            <div className="flex-1">
              <ManaBar mana={player.mana} maxMana={player.max_mana} />
            </div>
          </div>
        </div>
        <GoldCounter gold={player.gold} compact />
      </div>
    )
  }

  return (
    <PixelPanel className="flex flex-col gap-4">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-2 pb-3 border-b-2 border-rpg-border">
        <PixelAvatar />
        <div className="text-center">
          <div className="font-pixel text-pixel-sm text-rpg-text leading-relaxed">
            {player.name}
          </div>
          <div className="font-pixel text-pixel-xs text-rpg-gold mt-1">
            [{player.rank_title}]
          </div>
        </div>
      </div>

      {/* Stats */}
      <HPBar hp={player.hp} maxHp={player.max_hp} />
      <ManaBar mana={player.mana} maxMana={player.max_mana} showReset />

      {/* Gold */}
      <div className="border-t-2 border-rpg-border pt-3">
        <GoldCounter gold={player.gold} />
        <div className="mt-2 flex items-center gap-2">
          <span className="font-pixel text-pixel-xs text-rpg-muted">LIFETIME</span>
          <span className="font-pixel text-pixel-xs text-rpg-gold">
            {player.lifetime_gold.toLocaleString()} G
          </span>
        </div>
      </div>
    </PixelPanel>
  )
}
