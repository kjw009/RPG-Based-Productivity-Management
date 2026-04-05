import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'signup'

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name || 'Hero' } },
        })
        if (signUpError) throw signUpError
        setSignupDone(true)
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        // App.tsx onAuthStateChange handles redirect
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (signupDone) {
    return (
      <div className="min-h-screen bg-rpg-bg flex items-center justify-center p-4">
        <div className="pixel-panel p-8 max-w-sm w-full text-center">
          <div className="font-pixel text-pixel-base text-rpg-green mb-4">✓ ACCOUNT CREATED!</div>
          <div className="font-body text-body-base text-rpg-text mb-6">
            Check your email to confirm your account, then log in.
          </div>
          <button
            className="pixel-btn pixel-btn-primary"
            onClick={() => { setMode('login'); setSignupDone(false) }}
          >
            GO TO LOGIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rpg-bg flex flex-col items-center justify-center p-4">

      {/* Game title */}
      <div className="text-center mb-8">
        <div
          className="font-pixel text-rpg-gold mb-3"
          style={{ fontSize: 'clamp(12px, 3vw, 20px)', lineHeight: 2 }}
        >
          ⚔ RPG PRODUCTIVITY HUB ⚔
        </div>
        <div className="font-body text-body-lg text-rpg-muted">
          Your life. Your adventure. Your XP.
        </div>

        {/* Pixel art title divider */}
        <div className="font-pixel text-pixel-xs text-rpg-border mt-3 tracking-widest">
          ════════════════════
        </div>
      </div>

      {/* Login panel */}
      <div className="pixel-panel p-6 w-full max-w-sm">
        {/* Mode toggle */}
        <div className="flex mb-5 border-2 border-rpg-border">
          <button
            className={`flex-1 pixel-btn pixel-btn-sm ${mode === 'login' ? 'pixel-btn-gold' : 'pixel-btn-primary'}`}
            style={{ borderRadius: 0, borderBottom: mode === 'login' ? '4px solid rgba(0,0,0,0.6)' : 'none' }}
            onClick={() => { setMode('login'); setError(null) }}
          >
            LOGIN
          </button>
          <button
            className={`flex-1 pixel-btn pixel-btn-sm ${mode === 'signup' ? 'pixel-btn-gold' : 'pixel-btn-primary'}`}
            style={{ borderRadius: 0, borderBottom: mode === 'signup' ? '4px solid rgba(0,0,0,0.6)' : 'none' }}
            onClick={() => { setMode('signup'); setError(null) }}
          >
            NEW GAME
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <div>
              <label className="font-pixel text-pixel-xs text-rpg-muted block mb-1">
                HERO NAME
              </label>
              <input
                className="pixel-input"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                autoFocus
              />
            </div>
          )}

          <div>
            <label className="font-pixel text-pixel-xs text-rpg-muted block mb-1">EMAIL</label>
            <input
              type="email"
              className="pixel-input"
              placeholder="hero@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={mode === 'login'}
            />
          </div>

          <div>
            <label className="font-pixel text-pixel-xs text-rpg-muted block mb-1">PASSWORD</label>
            <input
              type="password"
              className="pixel-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="pixel-panel-crimson p-2">
              <p className="font-pixel text-pixel-xs text-rpg-hp">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="pixel-btn pixel-btn-gold w-full mt-2"
            disabled={loading}
          >
            {loading ? 'LOADING...' : mode === 'login' ? 'ENTER DUNGEON' : 'BEGIN ADVENTURE'}
          </button>
        </form>
      </div>

      <div className="font-pixel text-pixel-xs text-rpg-muted mt-6 text-center">
        PRESS START 2P © 2026
      </div>
    </div>
  )
}
