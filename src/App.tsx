import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Dashboard from './pages/Dashboard'
import { GameProvider } from './context/GameContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

export default function App() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession()

      if (sessionData.session) {
        setUserId(sessionData.session.user.id)
        return
      }

      // No session — sign in anonymously (enable in Supabase: Auth → Providers → Anonymous)
      const { data, error: signInError } = await supabase.auth.signInAnonymously()
      if (signInError || !data.session) {
        setError(signInError?.message ?? 'Could not connect. Check your .env Supabase credentials.')
        setUserId(null)
        return
      }
      setUserId(data.session.user.id)
    }

    init()

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
            Check that your <code>.env</code> file has valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values,
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
