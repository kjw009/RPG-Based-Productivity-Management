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
import StratagemGrid from '../components/stratagems/StratagemGrid'
import StratagemActions from '../components/ship/ShipActions'
import GoldCounter from '../components/player/GoldCounter'
import HPBar from '../components/player/HPBar'
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
      seedPlayer.mutate('Helldiver')
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
      <div className="min-h-screen bg-rpg-bg flex flex-col items-center justify-center gap-4">
        <div
          className="font-pixel text-pixel-sm animate-blink"
          style={{ color: '#FFE710', letterSpacing: '0.2em' }}
        >
          BOOTING COMMAND TERMINAL
        </div>
        <div className="flex gap-1">
          {[0,1,2,3,4].map(i => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                background: '#1a3040',
                animation: `blink 1s steps(1) infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  // ─── MOBILE LAYOUT ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen bg-rpg-bg flex flex-col">
        <KOOverlay />

        {/* Sticky top command strip */}
        <div
          className="sticky top-0 z-10 px-3 py-2"
          style={{
            background: 'linear-gradient(180deg, #0d1a24 0%, #070e14 100%)',
            borderBottom: '1px solid #1a3040',
            borderTop: '2px solid #FFE710',
            boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
          }}
        >
          <div className="flex items-center gap-2">
            {/* Status dot */}
            <div style={{
              width: 6,
              height: 6,
              background: '#FFE710',
              flexShrink: 0,
              boxShadow: '0 0 4px rgba(255,231,16,0.8)',
            }} />
            <span
              className="font-pixel text-pixel-xs truncate max-w-[90px]"
              style={{ color: '#FFE710', letterSpacing: '0.1em' }}
            >
              {player.name}
            </span>
            <div className="flex-1 min-w-0">
              <HPBar hp={player.hp} maxHp={player.max_hp} />
            </div>
            <GoldCounter gold={player.gold} compact />
          </div>
        </div>

        {/* Scrollable tactical content */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-5">
          <DailyQuote />
          <InboxSection userId={userId} />
          <PlayerPanel player={player} onSignOut={onSignOut} />
          <StratagemActions userId={userId} />
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
          <StratagemGrid userId={userId} />
          <div className="h-4" />
        </div>
      </div>
    )
  }

  // ─── DESKTOP LAYOUT — TACTICAL COMMAND TERMINAL ───────────────────────────
  return (
    <div className="min-h-screen bg-rpg-bg flex items-start" style={{ minHeight: '100dvh' }}>
      <KOOverlay />

      <div className="flex w-full min-h-screen">

        {/* ── Left Sidebar — Helldiver Profile ── */}
        <aside
          className="grimoire-cover sticky top-0 h-screen overflow-y-auto flex-shrink-0"
          style={{ width: 260 }}
        >
          {/* Header ID strip */}
          <div style={{
            marginTop: 3, /* offset for the hazard stripe ::before */
            padding: '14px 14px 10px',
            borderBottom: '1px solid #1a3040',
          }}>
            <div className="flex items-center gap-2 mb-1">
              <div style={{
                width: 6,
                height: 6,
                background: '#FFE710',
                flexShrink: 0,
                boxShadow: '0 0 4px rgba(255,231,16,0.8)',
                animation: 'statusPulse 2s ease-in-out infinite',
              }} />
              <span
                className="font-pixel text-pixel-xs tracking-widest"
                style={{ color: '#FFE710' }}
              >
                HELLDIVER
              </span>
            </div>
            <div
              className="font-pixel text-pixel-xs tracking-widest"
              style={{ color: '#2d5a7a', paddingLeft: 14 }}
            >
              PROFILE TERMINAL
            </div>
          </div>

          <div className="p-3 flex flex-col gap-4 relative z-10">
            <PlayerPanel player={player} onSignOut={onSignOut} />
            <StratagemActions userId={userId} />
            <StratagemGrid userId={userId} />
            <div className="flex-1" />

            {/* Bottom classification stamp */}
            <div
              className="text-center pb-2 font-pixel text-pixel-xs"
              style={{ color: '#1a3040', letterSpacing: '0.15em', opacity: 0.7 }}
            >
              ◈ SUPER EARTH ◈
            </div>
          </div>
        </aside>

        {/* Tactical divider */}
        <div className="grimoire-spine sticky top-0 h-screen" />

        {/* ── Main Content — Mission Board ── */}
        <main
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 min-w-0 relative"
          style={{
            background: '#070a0d',
            borderRight: '1px solid #0d1a24',
          }}
        >
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

        {/* Tactical divider */}
        <div className="grimoire-spine sticky top-0 h-screen" />

        {/* ── Right Sidebar — Command Intel ── */}
        <aside
          className="sticky top-0 h-screen overflow-y-auto flex-shrink-0"
          style={{
            width: 285,
            background: 'linear-gradient(180deg, #0a1218 0%, #070a0d 100%)',
            borderLeft: '1px solid #1a3040',
            borderTop: '3px solid #41639C',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '12px 14px 10px',
            borderBottom: '1px solid #1a3040',
            background: 'rgba(65,99,156,0.05)',
          }}>
            <div className="flex items-center gap-2">
              <div style={{
                width: 6,
                height: 6,
                background: '#41639C',
                flexShrink: 0,
                boxShadow: '0 0 4px rgba(65,99,156,0.8)',
              }} />
              <span
                className="font-pixel text-pixel-xs tracking-widest"
                style={{ color: '#41639C' }}
              >
                COMMAND INTEL
              </span>
            </div>
          </div>

          <div className="p-3 flex flex-col gap-4">
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
