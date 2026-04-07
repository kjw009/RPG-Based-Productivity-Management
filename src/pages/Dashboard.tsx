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
  /** Called to sign the user out and return to the login screen. */
  onSignOut: () => Promise<void>
}

export default function Dashboard({ userId, onSignOut }: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  // The layout diverges significantly between mobile and desktop, so we
  // track the breakpoint in state instead of relying on CSS alone.
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const { data: player, isLoading: playerLoading } = usePlayer(userId)
  const seedPlayer = useSeedPlayer(userId)

  useDailyReset(userId)

  useEffect(() => {
    // Brand-new anonymous users do not have a player row yet, so seed one
    // once the initial player query confirms there is nothing to load.
    if (!player && !playerLoading) {
      seedPlayer.mutate('Hero')
    }
  }, [player, playerLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Keep the layout mode in sync after the initial render.
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (playerLoading || !player) {
    return (
      <div className="min-h-screen bg-rpg-bg flex items-center justify-center">
        <p className="font-fraktur text-4xl text-rpg-gold animate-rune-glow">Opening Grimoire...</p>
      </div>
    )
  }

  // ─── MOBILE LAYOUT ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen bg-rpg-bg flex flex-col">
        <KOOverlay />

        {/* Sticky top bar — leather strip */}
        <div className="sticky top-0 z-10 px-3 py-2" style={{
          background: 'linear-gradient(180deg, #3a2010 0%, #2a1508 100%)',
          borderBottom: '2px solid #5a3820',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}>
          <div className="flex items-center gap-2">
            <span className="font-grimoire text-grimoire-sm text-rpg-gold truncate max-w-[100px]">
              {player.name}
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <HPBar hp={player.hp} maxHp={player.max_hp} />
              <ManaBar mana={player.mana} maxMana={player.max_mana} />
            </div>
            <GoldCounter gold={player.gold} compact />
          </div>
        </div>

        {/* Scrollable parchment */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-6 grimoire-page">
          <DailyQuote />
          <InboxSection userId={userId} />
          <PlayerPanel player={player} onSignOut={onSignOut} />
          <DailyTaskList userId={userId} />
          <HabitSection userId={userId} />
          <ProjectGrid
            userId={userId}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            selectedArea={selectedArea}
            onSelectArea={setSelectedArea}
          />
          <TodoList userId={userId} filterProjectId={selectedProjectId} filterArea={selectedArea} />
          <ShopGrid userId={userId} />
          <AbilityGrid userId={userId} />
          <div className="h-4" />
        </div>
      </div>
    )
  }

  // ─── DESKTOP LAYOUT — OPEN GRIMOIRE ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-rpg-bg flex items-start justify-center" style={{ minHeight: '100dvh' }}>
      <KOOverlay />

      {/* Grimoire outer cover */}
      <div className="flex w-full min-h-screen">
        {/* Left cover — leather binding */}
        <aside className="grimoire-cover sticky top-0 h-screen overflow-y-auto flex-shrink-0" style={{ width: 250 }}>
          <div className="p-3 flex flex-col gap-4 h-full relative z-10">
            {/* Title emboss */}
            <div className="text-center py-3 border-b border-rpg-gold/20">
              <div className="font-fraktur text-2xl text-rpg-gold leading-tight" style={{
                textShadow: '0 0 8px rgba(212,165,64,0.3), 0 2px 4px rgba(0,0,0,0.5)',
              }}>
                Grimoire
              </div>
              <div className="font-grimoire text-grimoire-sm text-rpg-gold/60 mt-1">of Productivity</div>
            </div>

            <PlayerPanel player={player} onSignOut={onSignOut} />
            <AbilityGrid userId={userId} />
            <div className="flex-1" />

            {/* Bottom clasp decoration */}
            <div className="text-center pb-2 opacity-40">
              <span className="font-grimoire text-grimoire-sm text-rpg-gold">— ⟁ —</span>
            </div>
          </div>
        </aside>

        {/* Spine binding */}
        <div className="grimoire-spine sticky top-0 h-screen" />

        {/* Main page — parchment left */}
        <main className="grimoire-page grimoire-page-left flex-1 overflow-y-auto p-4 flex flex-col gap-6 min-w-0 relative">
          <DailyQuote />
          <DailyTaskList userId={userId} />
          <ProjectGrid
            userId={userId}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            selectedArea={selectedArea}
            onSelectArea={setSelectedArea}
          />
          <TodoList userId={userId} filterProjectId={selectedProjectId} filterArea={selectedArea} />
          <div className="h-4" />
        </main>

        {/* Spine binding */}
        <div className="grimoire-spine sticky top-0 h-screen" />

        {/* Right page — parchment */}
        <aside className="grimoire-page grimoire-page-right sticky top-0 h-screen overflow-y-auto flex-shrink-0" style={{ width: 290 }}>
          <div className="p-3 flex flex-col gap-4 h-full relative">
            <InboxSection userId={userId} />
            <HabitSection userId={userId} />
            <ShopGrid userId={userId} />
            <div className="flex-1" />
          </div>
        </aside>
      </div>
    </div>
  )
}
