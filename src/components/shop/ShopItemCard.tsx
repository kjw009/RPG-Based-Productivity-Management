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
    <div className="inventory-slot p-3 flex flex-col gap-2">
      {/* Icon + name */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <div className="min-w-0">
          <div className="font-pixel text-pixel-xs text-rpg-text leading-relaxed truncate">
            {item.name}
          </div>
          <div className="font-pixel text-pixel-xs text-rpg-gold">
            {item.cost} 🪙
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="font-body text-body-sm text-rpg-muted">{item.description}</div>

      {/* Quantity */}
      <div className="flex items-center justify-between">
        <span className="font-pixel text-pixel-xs text-rpg-muted">
          OWN: {item.quantity}
        </span>
        {item.type === 'consumable' && (
          <span className="font-pixel text-pixel-xs text-rpg-muted">CONSUMABLE</span>
        )}
        {item.type === 'custom_reward' && (
          <span className="font-pixel text-pixel-xs text-rpg-purple">REWARD</span>
        )}
      </div>

      {/* Redeem success message */}
      {redeemSuccess && (
        <div className="font-pixel text-pixel-xs text-rpg-gold animate-blink">{redeemSuccess}</div>
      )}

      {/* Actions */}
      <div className="flex gap-1 flex-wrap">
        <PixelButton
          size="xs"
          variant="gold"
          onClick={() => onBuy(item)}
          disabled={!canAfford || isPending}
          title={!canAfford ? `Need ${item.cost - player.gold} more gold` : ''}
        >
          BUY
        </PixelButton>

        {item.type === 'consumable' && (
          <PixelButton
            size="xs"
            variant="success"
            onClick={() => onUse(item)}
            disabled={item.quantity < 1 || isPending}
          >
            USE
          </PixelButton>
        )}

        {item.type === 'custom_reward' && (
          <PixelButton
            size="xs"
            variant="purple"
            onClick={() => onRedeem(item)}
            disabled={item.quantity < 1 || isPending}
          >
            REDEEM
          </PixelButton>
        )}
      </div>
    </div>
  )
}
