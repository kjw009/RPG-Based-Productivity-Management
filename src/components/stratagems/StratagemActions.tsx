import { useState, useEffect } from 'react'

const MS_PER_DAY = 86_400_000

interface ActionDef {
  id: string
  label: string[]
  cooldownMs: number
  color: string
  dimColor: string
  storageKey: string
}

const ACTIONS: ActionDef[] = [
  {
    id: 'resupply',
    label: ['RESUPPLY'],
    cooldownMs: 1 * MS_PER_DAY,
    color: '#FFE710',
    dimColor: '#3a3600',
    storageKey: 'rpg_cooldown_resupply',
  },
  {
    id: 'eagle_rearm',
    label: ['EAGLE', 'REARM'],
    cooldownMs: 3 * MS_PER_DAY,
    color: '#7DF9FF',
    dimColor: '#0a2a2a',
    storageKey: 'rpg_cooldown_eagle_rearm',
  },
  {
    id: 'charge_orbital',
    label: ['CHARGE', 'ORBITAL'],
    cooldownMs: 7 * MS_PER_DAY,
    color: '#41639C',
    dimColor: '#0a1020',
    storageKey: 'rpg_cooldown_charge_orbital',
  },
]

// Ring geometry
const RADIUS = 22
const STROKE = 3
const SIZE = (RADIUS + STROKE) * 2   // 50
const CENTER = SIZE / 2              // 25
const CIRCUMFERENCE = 2 * Math.PI * RADIUS  // ≈ 138.2

function getRemainingMs(storageKey: string, cooldownMs: number): number {
  const started = localStorage.getItem(storageKey)
  if (!started) return 0
  const elapsed = Date.now() - Number(started)
  return Math.max(0, cooldownMs - elapsed)
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return ''
  const s = Math.ceil(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

// ── Icons ────────────────────────────────────────────────────────────────────

function ResupplyIcon({ dim }: { dim: boolean }) {
  const c = dim ? '#5a5000' : '#FFE710'
  const body = dim ? '#1a1800' : '#4a3800'
  return (
    <svg viewBox="0 0 16 16" width="20" height="20" style={{ imageRendering: 'pixelated' }}>
      {/* Crate */}
      <rect x="3" y="7" width="10" height="7" fill={body} />
      <rect x="3" y="7" width="10" height="2" fill={c} opacity="0.3" />
      <rect x="7" y="7" width="2" height="7" fill={c} opacity="0.25" />
      <rect x="3" y="10" width="10" height="1" fill={c} opacity="0.2" />
      <rect x="3" y="7" width="10" height="1" fill={c} opacity="0.5" />
      <rect x="3" y="13" width="10" height="1" fill={c} opacity="0.4" />
      {/* Down arrow */}
      <rect x="7" y="1" width="2" height="5" fill={c} />
      <rect x="5" y="4" width="6" height="2" fill={c} />
      <rect x="6" y="6" width="4" height="1" fill={c} />
    </svg>
  )
}

function EagleRearmIcon({ dim }: { dim: boolean }) {
  const c = dim ? '#0f3a3a' : '#7DF9FF'
  const bright = dim ? '#0a2a2a' : '#b0ffff'
  return (
    <svg viewBox="0 0 16 16" width="20" height="20" style={{ imageRendering: 'pixelated' }}>
      {/* Nose */}
      <rect x="7" y="1" width="2" height="1" fill={bright} />
      <rect x="7" y="2" width="2" height="2" fill={c} />
      {/* Fuselage */}
      <rect x="7" y="4" width="2" height="6" fill={c} />
      {/* Wings */}
      <rect x="3" y="6" width="4" height="2" fill={c} />
      <rect x="9" y="6" width="4" height="2" fill={c} />
      <rect x="2" y="7" width="2" height="1" fill={c} opacity="0.6" />
      <rect x="12" y="7" width="2" height="1" fill={c} opacity="0.6" />
      {/* Tail fins */}
      <rect x="5" y="9" width="2" height="2" fill={c} opacity="0.7" />
      <rect x="9" y="9" width="2" height="2" fill={c} opacity="0.7" />
      {/* Engine trail */}
      <rect x="7" y="10" width="2" height="2" fill={dim ? '#1a1a1a' : '#ff6622'} opacity="0.85" />
      <rect x="7" y="12" width="2" height="2" fill={dim ? '#111' : '#ffaa44'} opacity="0.5" />
    </svg>
  )
}

function ChargeOrbitalIcon({ dim }: { dim: boolean }) {
  const ring = dim ? '#1a2a3a' : '#7aabdc'
  const core = dim ? '#0a1828' : '#41639C'
  const glow = dim ? '#1a2030' : '#aad4ff'
  return (
    <svg viewBox="0 0 16 16" width="20" height="20" style={{ imageRendering: 'pixelated' }}>
      {/* Outer orbit ring (pixel circle) */}
      <rect x="6" y="1" width="4" height="1" fill={ring} opacity="0.8" />
      <rect x="4" y="2" width="2" height="1" fill={ring} opacity="0.7" />
      <rect x="10" y="2" width="2" height="1" fill={ring} opacity="0.7" />
      <rect x="2" y="4" width="1" height="2" fill={ring} opacity="0.7" />
      <rect x="13" y="4" width="1" height="2" fill={ring} opacity="0.7" />
      <rect x="2" y="10" width="1" height="2" fill={ring} opacity="0.7" />
      <rect x="13" y="10" width="1" height="2" fill={ring} opacity="0.7" />
      <rect x="4" y="13" width="2" height="1" fill={ring} opacity="0.7" />
      <rect x="10" y="13" width="2" height="1" fill={ring} opacity="0.7" />
      <rect x="6" y="14" width="4" height="1" fill={ring} opacity="0.8" />
      {/* Inner orb */}
      <rect x="6" y="6" width="4" height="4" fill={core} />
      <rect x="7" y="5" width="2" height="1" fill={core} />
      <rect x="7" y="10" width="2" height="1" fill={core} />
      <rect x="5" y="7" width="1" height="2" fill={core} />
      <rect x="10" y="7" width="1" height="2" fill={core} />
      {/* Core glow */}
      <rect x="7" y="7" width="2" height="2" fill={glow} opacity={dim ? 0.3 : 0.9} />
    </svg>
  )
}

// ── Single button ────────────────────────────────────────────────────────────

function ActionButton({ action }: { action: ActionDef }) {
  const [remaining, setRemaining] = useState(() =>
    getRemainingMs(action.storageKey, action.cooldownMs)
  )

  // Tick every second to keep the ring + countdown accurate.
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(getRemainingMs(action.storageKey, action.cooldownMs))
    }, 1000)
    return () => clearInterval(id)
  }, [action.storageKey, action.cooldownMs])

  const onCooldown = remaining > 0
  // Ring drains as time passes: offset starts at 0, grows to CIRCUMFERENCE.
  const elapsed = onCooldown ? action.cooldownMs - remaining : 0
  const dashOffset = CIRCUMFERENCE * (elapsed / action.cooldownMs)

  function handleClick() {
    if (onCooldown) return
    localStorage.setItem(action.storageKey, String(Date.now()))
    setRemaining(action.cooldownMs)
    // TODO: implement action effect
  }

  const Icon =
    action.id === 'resupply' ? ResupplyIcon :
    action.id === 'eagle_rearm' ? EagleRearmIcon :
    ChargeOrbitalIcon

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Ring + button wrapper */}
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>

        {/* SVG cooldown ring — always present, drains when on cooldown */}
        <svg
          width={SIZE} height={SIZE}
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={CENTER} cy={CENTER} r={RADIUS}
            fill="none"
            stroke="#1a3040"
            strokeWidth={STROKE}
          />
          {/* Remaining arc — full when ready, shrinks as cooldown elapses */}
          <circle
            cx={CENTER} cy={CENTER} r={RADIUS}
            fill="none"
            stroke={onCooldown ? action.dimColor : action.color}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>

        {/* Circular button */}
        <button
          onClick={handleClick}
          disabled={onCooldown}
          title={onCooldown ? `${action.label.join(' ')}: ${formatRemaining(remaining)}` : action.label.join(' ')}
          style={{
            position: 'absolute',
            top: STROKE,
            left: STROKE,
            width: SIZE - STROKE * 2,
            height: SIZE - STROKE * 2,
            borderRadius: '50%',
            background: onCooldown
              ? 'rgba(10,15,20,0.95)'
              : `radial-gradient(circle at 35% 35%, ${action.color}22 0%, ${action.color}08 100%)`,
            border: `1px solid ${onCooldown ? '#1a2a30' : action.color}`,
            cursor: onCooldown ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s ease, border-color 0.3s ease',
            boxShadow: onCooldown ? 'none' : `0 0 8px ${action.color}30`,
          }}
        >
          {onCooldown ? (
            // Show countdown when on cooldown
            <span
              className="font-pixel"
              style={{
                color: action.dimColor,
                fontSize: 6,
                letterSpacing: '0.05em',
                textAlign: 'center',
                lineHeight: 1.4,
                filter: 'brightness(3)',
              }}
            >
              {formatRemaining(remaining)}
            </span>
          ) : (
            <Icon dim={false} />
          )}
        </button>
      </div>

      {/* Label */}
      <div className="flex flex-col items-center" style={{ gap: 0 }}>
        {action.label.map((line) => (
          <span
            key={line}
            className="font-pixel"
            style={{
              fontSize: 6,
              letterSpacing: '0.08em',
              color: onCooldown ? '#2d4050' : action.color,
              lineHeight: 1.5,
              transition: 'color 0.3s ease',
            }}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Section ──────────────────────────────────────────────────────────────────

export default function StratagemActions() {
  return (
    <div
      className="flex flex-col gap-2"
      style={{ borderBottom: '1px solid #1a3040', paddingBottom: 12 }}
    >
      <span
        className="font-pixel text-pixel-xs"
        style={{ color: '#2d5a7a', letterSpacing: '0.15em' }}
      >
        STRATAGEMS
      </span>
      <div className="flex justify-around items-center">
        {ACTIONS.map((action) => (
          <ActionButton key={action.id} action={action} />
        ))}
      </div>
    </div>
  )
}
