// Pixel-art SVG icons for each ship action

export function ResupplyIcon({ dim }: { dim: boolean }) {
  const c    = dim ? '#5a5000' : '#FFE710'
  const body = dim ? '#1a1800' : '#4a3800'
  return (
    <svg viewBox="0 0 16 16" width="20" height="20" style={{ imageRendering: 'pixelated' }}>
      {/* Crate body */}
      <rect x="3" y="7" width="10" height="7" fill={body} />
      <rect x="3" y="7" width="10" height="1" fill={c} opacity="0.5" /> {/* top edge */}
      <rect x="3" y="13" width="10" height="1" fill={c} opacity="0.4" /> {/* bottom edge */}
      {/* Crate slats */}
      <rect x="7" y="7" width="2" height="7" fill={c} opacity="0.2" />
      <rect x="3" y="10" width="10" height="1" fill={c} opacity="0.15" />
      {/* Down arrow */}
      <rect x="7" y="1" width="2" height="5" fill={c} />
      <rect x="5" y="4" width="6" height="2" fill={c} />
      <rect x="6" y="6" width="4" height="1" fill={c} />
    </svg>
  )
}

export function EagleRearmIcon({ dim }: { dim: boolean }) {
  const c      = dim ? '#0f3a3a' : '#7DF9FF'
  const bright = dim ? '#0a2a2a' : '#b0ffff'
  const flame  = dim ? '#1a1a1a' : '#ff6622'
  const trail  = dim ? '#111111' : '#ffaa44'
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
      <rect x="7" y="10" width="2" height="2" fill={flame} opacity="0.85" />
      <rect x="7" y="12" width="2" height="2" fill={trail} opacity="0.5" />
    </svg>
  )
}

export function ChargeOrbitalIcon({ dim }: { dim: boolean }) {
  const ring = dim ? '#1a2a3a' : '#7aabdc'
  const core = dim ? '#0a1828' : '#41639C'
  const glow = dim ? '#1a2030' : '#aad4ff'
  return (
    <svg viewBox="0 0 16 16" width="20" height="20" style={{ imageRendering: 'pixelated' }}>
      {/* Outer pixel orbit ring */}
      <rect x="6"  y="1"  width="4" height="1" fill={ring} opacity="0.8" />
      <rect x="4"  y="2"  width="2" height="1" fill={ring} opacity="0.7" />
      <rect x="10" y="2"  width="2" height="1" fill={ring} opacity="0.7" />
      <rect x="2"  y="4"  width="1" height="2" fill={ring} opacity="0.7" />
      <rect x="13" y="4"  width="1" height="2" fill={ring} opacity="0.7" />
      <rect x="2"  y="10" width="1" height="2" fill={ring} opacity="0.7" />
      <rect x="13" y="10" width="1" height="2" fill={ring} opacity="0.7" />
      <rect x="4"  y="13" width="2" height="1" fill={ring} opacity="0.7" />
      <rect x="10" y="13" width="2" height="1" fill={ring} opacity="0.7" />
      <rect x="6"  y="14" width="4" height="1" fill={ring} opacity="0.8" />
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

export function getShipActionIcon(actionId: string, dim: boolean): JSX.Element {
  switch (actionId) {
    case 'resupply':       return <ResupplyIcon dim={dim} />
    case 'eagle_rearm':    return <EagleRearmIcon dim={dim} />
    case 'charge_orbital': return <ChargeOrbitalIcon dim={dim} />
    default:               return <ResupplyIcon dim={dim} />
  }
}
