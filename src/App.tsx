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
      <div className="flex items-center justify-center h-screen bg-rpg-bg">
        <p className="font-pixel text-pixel-base text-rpg-gold animate-blink">LOADING...</p>
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
