/**
 * LoginScreen — shown when no Supabase session exists.
 * Authenticates via Google OAuth.
 */

interface Props {
  onSignInWithGoogle: () => Promise<void>
  error: string | null
}

export default function LoginScreen({ onSignInWithGoogle, error }: Props) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-rpg-bg p-6">
      <div className="pixel-panel p-8 max-w-sm w-full flex flex-col gap-6 text-center">

        {/* Title */}
        <div className="flex flex-col gap-1">
          <div
            className="font-fraktur text-4xl text-rpg-gold"
            style={{ textShadow: '0 0 10px rgba(212,165,64,0.4), 0 2px 4px rgba(0,0,0,0.5)' }}
          >
            Grimoire
          </div>
          <div className="font-grimoire text-grimoire-sm text-rpg-gold/60 italic">
            of Productivity
          </div>
        </div>

        <div className="font-grimoire text-grimoire-sm text-rpg-gold/30">— ✦ —</div>

        <div className="flex flex-col gap-4">
          <p className="font-grimoire text-grimoire-base text-rpg-text">
            Begin your quest, hero.
          </p>

          {error && (
            <div className="pixel-panel-crimson p-3">
              <p className="font-body text-body-sm text-rpg-hp">{error}</p>
            </div>
          )}

          <button
            className="pixel-btn pixel-btn-primary w-full flex items-center justify-center gap-2"
            onClick={onSignInWithGoogle}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            SIGN IN WITH GOOGLE
          </button>
        </div>
      </div>
    </div>
  )
}
