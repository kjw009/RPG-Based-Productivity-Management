/**
 * LoginScreen — Super Earth Military Briefing Terminal.
 * Shown when no Supabase session exists. Authenticates via Google OAuth.
 */

interface Props {
  onSignInWithGoogle: () => Promise<void>
  error: string | null
}

export default function LoginScreen({ onSignInWithGoogle, error }: Props) {
  return (
    <div
      className="flex items-center justify-center min-h-screen p-6"
      style={{
        background: '#070a0d',
        backgroundImage: `
          radial-gradient(ellipse at 50% 30%, rgba(65,99,156,0.12) 0%, transparent 60%),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.04) 3px,
            rgba(0,0,0,0.04) 4px
          )
        `,
      }}
    >
      <div className="w-full max-w-sm flex flex-col gap-0">

        {/* Top hazard stripe */}
        <div className="hazard-stripe h-2 w-full" />

        {/* Main panel */}
        <div style={{
          background: 'linear-gradient(160deg, #0d1a24 0%, #070e14 100%)',
          border: '1px solid #1a3040',
          borderTop: 'none',
          borderBottom: 'none',
        }}>

          {/* Header bar */}
          <div style={{
            background: 'linear-gradient(90deg, #0a1e2e 0%, #0d2538 50%, #0a1e2e 100%)',
            borderBottom: '1px solid #1a3040',
            padding: '12px 24px',
          }}>
            <div className="flex items-center gap-3">
              {/* Status indicator */}
              <div style={{
                width: 8,
                height: 8,
                background: '#FFE710',
                flexShrink: 0,
                animation: 'statusPulse 2s ease-in-out infinite',
                boxShadow: '0 0 6px rgba(255,231,16,0.8)',
              }} />
              <div
                className="font-pixel text-pixel-xs tracking-widest"
                style={{ color: '#4a6878' }}
              >
                SUPER EARTH PRODUCTIVITY COMMAND
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 flex flex-col gap-6">

            {/* Title */}
            <div className="text-center flex flex-col gap-2">
              <div
                className="font-pixel tracking-widest"
                style={{
                  fontSize: 22,
                  color: '#FFE710',
                  textShadow: '0 0 20px rgba(255,231,16,0.5), 0 0 40px rgba(255,231,16,0.2)',
                  letterSpacing: '0.15em',
                }}
              >
                HELLDIVER
              </div>
              <div
                className="font-pixel text-pixel-xs tracking-widest"
                style={{ color: '#2d5a7a' }}
              >
                COMMAND TERMINAL
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mt-2">
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #1a3040)' }} />
                <span style={{ color: '#2d5a7a', fontSize: 10, fontFamily: 'Orbitron' }}>◈</span>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #1a3040, transparent)' }} />
              </div>
            </div>

            {/* Briefing text */}
            <div style={{
              background: '#050c12',
              border: '1px solid #1a3040',
              borderLeft: '3px solid #FFE710',
              padding: '10px 14px',
            }}>
              <div className="font-grimoire text-grimoire-sm" style={{ color: '#4a6878', marginBottom: 2 }}>
                MISSION BRIEFING
              </div>
              <div className="font-grimoire text-grimoire-base" style={{ color: '#c8d8e4' }}>
                Report for duty, Helldiver. Democracy does not defend itself.
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(50,0,0,0.6)',
                border: '1px solid #6a1a1a',
                borderLeft: '3px solid #FF3344',
                padding: '8px 12px',
              }}>
                <div className="font-grimoire text-grimoire-sm" style={{ color: '#FF3344' }}>
                  ⚠ AUTH ERROR: {error}
                </div>
              </div>
            )}

            {/* Sign in button */}
            <button
              onClick={onSignInWithGoogle}
              className="w-full flex items-center justify-center gap-3"
              style={{
                background: 'linear-gradient(180deg, #141f0a 0%, #0c1406 100%)',
                border: '1px solid #4a6a00',
                borderTop: '1px solid #FFE710',
                color: '#FFE710',
                fontFamily: 'Orbitron, monospace',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                padding: '12px 20px',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                textShadow: '0 0 10px rgba(255,231,16,0.5)',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, #1c2a0e 0%, #121808 100%)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(255,231,16,0.25)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, #141f0a 0%, #0c1406 100%)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              AUTHENTICATE VIA GOOGLE
            </button>

            {/* Classification stamp */}
            <div className="text-center">
              <span
                className="font-pixel text-pixel-xs"
                style={{ color: '#1a3040', letterSpacing: '0.2em' }}
              >
                CLASSIFIED — SUPER EARTH USE ONLY
              </span>
            </div>
          </div>
        </div>

        {/* Bottom hazard stripe */}
        <div className="hazard-stripe h-2 w-full" />

      </div>
    </div>
  )
}
