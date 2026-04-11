import { useState, useEffect } from 'react'
import { getShipActionIcon } from './ShipActionIcons'

// Ring geometry constants
const RADIUS      = 22
const STROKE      = 3
const SIZE        = (RADIUS + STROKE) * 2  // 50px total
const CENTER      = SIZE / 2               // 25
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ≈ 138.2

export interface ActionDef {
  id: string
  label: string[]   // one or two lines shown below the button
  cooldownMs: number
  color: string     // active accent colour
  dimColor: string  // muted colour used during cooldown
}

interface Props {
  action: ActionDef
  activatedAt: string | null  // ISO timestamp from DB, or null if never activated
  onActivate: () => void
  isPending: boolean
}

function getRemainingMs(activatedAt: string | null, cooldownMs: number): number {
  if (!activatedAt) return 0
  const elapsed = Date.now() - new Date(activatedAt).getTime()
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

export default function ShipActionButton({ action, activatedAt, onActivate, isPending }: Props) {
  const [remaining, setRemaining] = useState(() =>
    getRemainingMs(activatedAt, action.cooldownMs)
  )

  // Recompute when activatedAt changes (e.g. after a fresh activation).
  useEffect(() => {
    setRemaining(getRemainingMs(activatedAt, action.cooldownMs))
  }, [activatedAt, action.cooldownMs])

  // Tick every second to keep the ring and countdown in sync.
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(getRemainingMs(activatedAt, action.cooldownMs))
    }, 1000)
    return () => clearInterval(id)
  }, [activatedAt, action.cooldownMs])

  const onCooldown = remaining > 0
  const disabled   = onCooldown || isPending

  // Ring drains from full → empty over the cooldown period.
  const elapsed    = onCooldown ? action.cooldownMs - remaining : 0
  const dashOffset = CIRCUMFERENCE * (elapsed / action.cooldownMs)

  function handleClick() {
    if (disabled) return
    onActivate()
  }

  return (
    <div className="flex flex-col items-center gap-1.5">

      {/* Ring + button */}
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>

        {/* SVG cooldown ring — rotated so drain starts from 12 o'clock */}
        <svg
          width={SIZE}
          height={SIZE}
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            cx={CENTER} cy={CENTER} r={RADIUS}
            fill="none"
            stroke="#1a3040"
            strokeWidth={STROKE}
          />
          {/* Remaining arc */}
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

        {/* Inner circular button */}
        <button
          onClick={handleClick}
          disabled={disabled}
          title={
            onCooldown
              ? `${action.label.join(' ')}: ${formatRemaining(remaining)}`
              : action.label.join(' ')
          }
          style={{
            position: 'absolute',
            top: STROKE,
            left: STROKE,
            width:  SIZE - STROKE * 2,
            height: SIZE - STROKE * 2,
            borderRadius: '50%',
            background: onCooldown
              ? 'rgba(10,15,20,0.95)'
              : `radial-gradient(circle at 35% 35%, ${action.color}22 0%, ${action.color}08 100%)`,
            border: `1px solid ${onCooldown ? '#1a2a30' : action.color}`,
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s ease, border-color 0.3s ease',
            boxShadow: onCooldown ? 'none' : `0 0 8px ${action.color}30`,
          }}
        >
          {onCooldown ? (
            <span
              className="font-pixel"
              style={{
                color: action.color,
                fontSize: 6,
                letterSpacing: '0.05em',
                textAlign: 'center',
                lineHeight: 1.4,
                opacity: 0.5,
              }}
            >
              {formatRemaining(remaining)}
            </span>
          ) : (
            getShipActionIcon(action.id, false)
          )}
        </button>
      </div>

      {/* Label below button */}
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
