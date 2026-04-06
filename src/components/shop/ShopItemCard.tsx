/**
 * Displays a shop reward item with purchase and info details.
 */
import PixelButton from '../shared/PixelButton'
import type { ShopItem, Player } from '../../types'

const EFFECT_ICONS: Record<string, string> = {
  health_potion: '🧪',
  double_gold:   '📜',
  custom:        '🎁',
}

interface Props {
  item: ShopItem
  player: Player
  onBuy: (item: ShopItem) => void
  onUse: (item: ShopItem) => void
  onRedeem: (item: ShopItem) => void
  isPending: boolean
  redeemSuccess?: string | null
}

export default function ShopItemCard({ item, player, onBuy, onUse, onRedeem, isPending, redeemSuccess }: Props) {
  const canAfford = player.gold >= item.cost
  const icon = EFFECT_ICONS[item.effect_type] ?? '🎁'

  return (
    <div className="inventory-slot px-2 py-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none">{icon}</span>
        <span className="font-grimoire text-grimoire-base ink-text truncate flex-1 min-w-0">
          {item.name}
        </span>
        <span className="font-grimoire text-grimoire-sm ink-gold font-bold flex-shrink-0">{item.cost}🪙</span>
        <span className="font-grimoire text-grimoire-sm ink-muted flex-shrink-0">×{item.quantity}</span>
      </div>

      <div className="flex items-center gap-1 mt-1 flex-wrap">
        <span className="font-grimoire text-grimoire-sm ink-muted italic truncate flex-1 min-w-0">
          {item.description}
        </span>
        <div className="flex gap-0.5 flex-shrink-0">
          <PixelButton
            size="xs"
            variant="gold"
            onClick={() => onBuy(item)}
            disabled={!canAfford || isPending}
            title={!canAfford ? `Need ${item.cost - player.gold} more gold` : ''}
          >
            Buy
          </PixelButton>
          {item.type === 'consumable' && (
            <PixelButton size="xs" variant="success" onClick={() => onUse(item)} disabled={item.quantity < 1 || isPending}>
              Use
            </PixelButton>
          )}
          {item.type === 'custom_reward' && (
            <PixelButton size="xs" variant="purple" onClick={() => onRedeem(item)} disabled={item.quantity < 1 || isPending}>
              Redeem
            </PixelButton>
          )}
        </div>
      </div>

      {redeemSuccess && (
        <div className="font-grimoire text-grimoire-sm ink-gold mt-1 animate-blink">{redeemSuccess}</div>
      )}
    </div>
  )
}
