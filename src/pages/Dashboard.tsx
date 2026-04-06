import { useState, useEffect } from 'react'
import { usePlayer, useSeedPlayer } from '../hooks/usePlayer'
import { useDailyReset } from '../hooks/useDailyReset'

import KOOverlay from '../components/player/KOOverlay'
import PlayerPanel from '../components/player/PlayerPanel'
import DailyQuote from '../components/quote/DailyQuote'
import DailyTaskList from '../components/dailies/DailyTaskList'
import HabitSection from '../components/habits/HabitSection'
import ProjectGrid from '../components/projects/ProjectGrid'
import TodoList from '../components/todos/TodoList'
import ShopGrid from '../components/shop/ShopGrid'
import AbilityGrid from '../components/abilities/AbilityGrid'
import GoldCounter from '../components/player/GoldCounter'
import HPBar from '../components/player/HPBar'
import ManaBar from '../components/player/ManaBar'
import InboxSection from '../components/inbox/InboxSection'

interface Props {
  userId: string
}

export default function Dashboard({ userId }: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const { data: player, isLoading: playerLoading } = usePlayer(userId)
  const seedPlayer = useSeedPlayer(userId)

  // Daily reset runs once per session per day
  useDailyReset(userId)

  // Seed player row + default abilities + shop items on first ever load
  useEffect(() => {
    if (!player && !playerLoading) {
      seedPlayer.mutate('Hero')
    }
  }, [player, playerLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Responsive detection
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (playerLoading || !player) {
    return (
      <div className="min-h-screen bg-rpg-bg flex items-center justify-center">
        <p className="font-pixel text-pixel-base text-rpg-gold animate-blink">LOADING SAVE DATA...</p>
      </div>
    )
  }

  // ─── MOBILE LAYOUT ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen bg-rpg-bg flex flex-col">
        <KOOverlay />

        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 bg-rpg-surface border-b-2 border-rpg-border px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-pixel-xs text-rpg-gold truncate max-w-[100px]">
              {player.name}
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <HPBar hp={player.hp} maxHp={player.max_hp} />
              <ManaBar mana={player.mana} maxMana={player.max_mana} />
            </div>
            <GoldCounter gold={player.gold} compact />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-6">
          <DailyQuote />
          <InboxSection userId={userId} />
          <PlayerPanel player={player} />
          <DailyTaskList userId={userId} />
          <HabitSection userId={userId} />
          <ProjectGrid
            userId={userId}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
          <TodoList userId={userId} filterProjectId={selectedProjectId} />
          <ShopGrid userId={userId} />
          <AbilityGrid userId={userId} />
          <div className="h-4" />
        </div>
      </div>
    )
  }

  // ─── DESKTOP LAYOUT ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-rpg-bg flex" style={{ minHeight: '100dvh' }}>
      <KOOverlay />

      {/* Left sidebar — sticky */}
      <aside
        className="sticky top-0 h-screen overflow-y-auto flex-shrink-0"
        style={{ width: 240 }}
      >
        <div className="p-3 flex flex-col gap-4 h-full">
          <div className="font-pixel text-pixel-xs text-rpg-gold text-center py-2 border-b-2 border-rpg-border leading-relaxed">
            ⚔ RPG HUB ⚔
          </div>

          <PlayerPanel player={player} />
          <AbilityGrid userId={userId} />

          <div className="flex-1" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 min-w-0">
        <DailyQuote />
        <InboxSection userId={userId} />
        <DailyTaskList userId={userId} />
        <HabitSection userId={userId} />
        <ProjectGrid
          userId={userId}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />
        <TodoList userId={userId} filterProjectId={selectedProjectId} />
        <ShopGrid userId={userId} />
        <div className="h-4" />
      </main>
    </div>
  )
}
