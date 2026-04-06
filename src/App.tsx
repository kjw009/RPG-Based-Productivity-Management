import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from './lib/supabase'
import Dashboard from './pages/Dashboard'
import { GameProvider } from './context/GameContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

/**
 * App shell — handles the Supabase anonymous auth lifecycle.
 *
 * On first ever load: signInAnonymously() creates a persistent anonymous
 * session stored in localStorage by the Supabase client. Subsequent loads
 * restore that session via getSession(), so the same anonymous user_id is
 * reused and their data persists across page refreshes and app restarts.
 *
 * There is no login screen — the app opens directly into the dashboard.
 * Requires "Allow anonymous sign-ins" to be enabled in:
 *   Supabase Dashboard → Authentication → Providers → Anonymous
 */
export default function App() {
  // undefined = still resolving, null = failed, string = ready
  const [userId, setUserId] = useState<string | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession()

      if (sessionData.session) {
        setUserId(sessionData.session.user.id)
        return
      }

      // No existing session — create a new anonymous one
      const { data, error: signInError } = await supabase.auth.signInAnonymously()
      if (signInError || !data.session) {
        setError(signInError?.message ?? 'Could not connect. Check .env Supabase credentials.')
        setUserId(null)
        return
      }
      setUserId(data.session.user.id)
    }

    init()

    // Keep userId in sync if the session changes (e.g. token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setUserId(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (userId === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-rpg-bg">
        <p className="font-pixel text-pixel-base text-rpg-gold animate-blink">LOADING...</p>
      </div>
    )
  }

  if (userId === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-rpg-bg p-6">
        <div className="pixel-panel p-6 max-w-sm w-full text-center flex flex-col gap-4">
          <p className="font-pixel text-pixel-sm text-rpg-hp">CONNECTION ERROR</p>
          {error && <p className="font-body text-body-base text-rpg-text">{error}</p>}
          <p className="font-body text-body-sm text-rpg-muted">
            Check your <code>.env</code> has valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY,
            and that Anonymous sign-in is enabled in Supabase → Auth → Providers.
          </p>
          <button className="pixel-btn pixel-btn-primary" onClick={() => window.location.reload()}>
            RETRY
          </button>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <Dashboard userId={userId} />
      </GameProvider>
    </QueryClientProvider>
  )
}
