/**
 * Grid layout for displaying shop reward items.
 */
import { useState } from 'react'
import SectionHeader from '../shared/SectionHeader'
import PixelButton from '../shared/PixelButton'
import ShopItemCard from './ShopItemCard'
import AddRewardForm from './AddRewardForm'
import { useShop } from '../../hooks/useShop'
import { usePlayer } from '../../hooks/usePlayer'

interface Props { userId: string }

export default function ShopGrid({ userId }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [redeemMsg, setRedeemMsg] = useState<string | null>(null)

  const { data: items, isLoading, buyItem, useItem, redeemItem, addReward } = useShop(userId)
  const { data: player } = usePlayer(userId)

  if (!player) return null

  function handleRedeem(item: { id: string; name: string; quantity: number }) {
    redeemItem.mutate(item as Parameters<typeof redeemItem.mutate>[0])
    setRedeemMsg(`🎉 Enjoy your ${item.name}!`)
    setTimeout(() => setRedeemMsg(null), 3000)
  }

  return (
    <section>
      <SectionHeader title="ITEM SHOP" sub={`${player.gold} RS`} />

      {isLoading && (
        <div className="font-grimoire text-grimoire-sm text-rpg-muted p-2">Loading...</div>
      )}

      <div className="flex flex-col gap-1 mb-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
        {(items ?? []).map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            player={player}
            onBuy={(i) => buyItem.mutate(i)}
            onUse={(i) => useItem.mutate(i)}
            onRedeem={(i) => handleRedeem(i)}
            isPending={buyItem.isPending || useItem.isPending || redeemItem.isPending}
            redeemSuccess={redeemMsg}
          />
        ))}
      </div>

      {showForm ? (
        <AddRewardForm
          onAdd={(payload) => { addReward.mutate(payload); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
          isLoading={addReward.isPending}
        />
      ) : (
        <PixelButton size="sm" variant="purple" onClick={() => setShowForm(true)}>
          + CUSTOM REWARD
        </PixelButton>
      )}
    </section>
  )
}
