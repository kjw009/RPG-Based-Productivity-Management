import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from './lib/supabase'
import Dashboard from './pages/Dashboard'
import LoginScreen from './components/auth/LoginScreen'
import { GameProvider } from './context/GameContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

/**
 * App shell — manages Supabase Google OAuth auth.
 *
 * Auth states:
 *  - undefined  → still resolving (show LOADING)
 *  - null       → no session (show LoginScreen)
 *  - string     → authenticated user_id (show Dashboard)
 */
export default function App() {
  // undefined = resolving · null = unauthenticated · string = user id
  const [userId, setUserId] = useState<string | null | undefined>(undefined)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession()
      setUserId(sessionData.session?.user.id ?? null)
    }

    init()

    // Keep state in sync after OAuth redirects, token refreshes, and sign-outs
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
      if (session) setAuthError(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignInWithGoogle() {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setAuthError(error.message)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (userId === undefined) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen bg-rpg-bg gap-3"
        style={{
          background: '#070a0d',
          backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(65,99,156,0.08) 0%, transparent 60%)',
        }}
      >
        <p
          className="font-pixel text-pixel-xs animate-blink"
          style={{ color: '#FFE710', letterSpacing: '0.2em' }}
        >
          ESTABLISHING UPLINK...
        </p>
      </div>
    )
  }

  if (userId === null) {
    return (
      <LoginScreen
        onSignInWithGoogle={handleSignInWithGoogle}
        error={authError}
      />
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <Dashboard userId={userId} onSignOut={handleSignOut} />
      </GameProvider>
    </QueryClientProvider>
  )
}
