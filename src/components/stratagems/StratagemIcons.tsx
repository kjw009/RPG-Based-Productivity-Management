// Detailed pixel-art SVG icons for each stratagem
function MachineGunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="28" height="28" className="stratagem-icon" style={{ imageRendering: 'pixelated' }}>
      {/* Barrel */}
      <rect x="1" y="6" width="9" height="2" fill="#7a8a8a" />
      <rect x="1" y="6" width="9" height="1" fill="#9aacac" opacity="0.6" /> {/* barrel top shine */}
      <rect x="10" y="7" width="2" height="1" fill="#5a6a6a" /> {/* muzzle shadow */}
      <rect x="10" y="6" width="2" height="1" fill="#aabcbc" /> {/* muzzle tip */}
      {/* Muzzle flash */}
      <rect x="12" y="5" width="2" height="1" fill="#ffcc44" opacity="0.9" />
      <rect x="13" y="6" width="2" height="2" fill="#ff8800" opacity="0.8" />
      <rect x="12" y="8" width="2" height="1" fill="#ffcc44" opacity="0.9" />
      <rect x="14" y="6" width="1" height="1" fill="#ffffff" opacity="0.7" /> {/* flash center */}
      {/* Receiver body */}
      <rect x="4" y="5" width="5" height="5" fill="#5a6060" />
      <rect x="4" y="5" width="5" height="1" fill="#7a8888" opacity="0.5" /> {/* receiver top */}
      {/* Magazine */}
      <rect x="5" y="10" width="3" height="4" fill="#4a5050" />
      <rect x="5" y="10" width="3" height="1" fill="#6a7878" opacity="0.4" />
      {/* Stock */}
      <rect x="1" y="7" width="3" height="3" fill="#5a4030" />
      <rect x="1" y="7" width="3" height="1" fill="#7a6050" opacity="0.5" />
      {/* Trigger guard */}
      <rect x="6" y="9" width="1" height="2" fill="#3a4040" />
      {/* Ejected shell */}
      <rect x="7" y="4" width="1" height="2" fill="#c8a020" opacity="0.7" />
    </svg>
  )
}

function OrbitalStrikeIcon() {
  return (
    <svg viewBox="0 0 16 16" width="28" height="28" className="stratagem-icon" style={{ imageRendering: 'pixelated' }}>
      {/* Target reticle on ground */}
      <rect x="6" y="13" width="4" height="1" fill="#ff3344" opacity="0.9" />
      <rect x="5" y="12" width="1" height="1" fill="#ff3344" opacity="0.9" />
      <rect x="10" y="12" width="1" height="1" fill="#ff3344" opacity="0.9" />
      <rect x="4" y="11" width="1" height="1" fill="#ff3344" opacity="0.6" />
      <rect x="11" y="11" width="1" height="1" fill="#ff3344" opacity="0.6" />
      {/* Center crosshair dot */}
      <rect x="7" y="14" width="2" height="1" fill="#ffffff" opacity="0.9" />
      {/* Strike beam */}
      <rect x="7" y="2" width="2" height="12" fill="#7dd9ff" opacity="0.25" /> {/* outer glow */}
      <rect x="7" y="2" width="2" height="11" fill="#aaeeff" opacity="0.4" />
      <rect x="8" y="1" width="1" height="13" fill="#ffffff" opacity="0.8" /> {/* core beam */}
      {/* Orbital glow at top */}
      <rect x="6" y="0" width="4" height="2" fill="#7dd9ff" opacity="0.5" />
      <rect x="5" y="1" width="1" height="1" fill="#7dd9ff" opacity="0.3" />
      <rect x="10" y="1" width="1" height="1" fill="#7dd9ff" opacity="0.3" />
      {/* Impact sparks */}
      <rect x="5" y="10" width="1" height="1" fill="#ffcc44" opacity="0.7" />
      <rect x="10" y="10" width="1" height="1" fill="#ffcc44" opacity="0.7" />
      <rect x="4" y="12" width="1" height="1" fill="#ff8800" opacity="0.5" />
      <rect x="11" y="12" width="1" height="1" fill="#ff8800" opacity="0.5" />
    </svg>
  )
}

function EagleStrafingIcon() {
  return (
    <svg viewBox="0 0 16 16" width="28" height="28" className="stratagem-icon" style={{ imageRendering: 'pixelated' }}>
      {/* Eagle/jet body (angled dive) */}
      <rect x="8" y="1" width="2" height="2" fill="#c8d0d8" /> {/* nose */}
      <rect x="7" y="3" width="3" height="2" fill="#b0b8c0" /> {/* fuselage front */}
      <rect x="6" y="5" width="4" height="2" fill="#9aa2aa" /> {/* fuselage mid */}
      <rect x="6" y="7" width="3" height="2" fill="#8a9298" /> {/* fuselage rear */}
      {/* Wings swept back */}
      <rect x="3" y="4" width="4" height="1" fill="#b0b8c0" /> {/* left wing */}
      <rect x="2" y="5" width="3" height="1" fill="#9aa2aa" opacity="0.8" />
      <rect x="10" y="4" width="3" height="1" fill="#b0b8c0" /> {/* right wing */}
      <rect x="12" y="5" width="2" height="1" fill="#9aa2aa" opacity="0.8" />
      {/* Tail fins */}
      <rect x="5" y="8" width="2" height="1" fill="#9aa2aa" />
      <rect x="9" y="8" width="2" height="1" fill="#9aa2aa" />
      {/* Engine glow */}
      <rect x="7" y="9" width="2" height="1" fill="#ff6622" opacity="0.9" />
      <rect x="7" y="10" width="2" height="1" fill="#ffaa44" opacity="0.6" />
      {/* Gun strafing lines */}
      <rect x="4" y="11" width="1" height="3" fill="#ffcc44" opacity="0.8" />
      <rect x="6" y="10" width="1" height="4" fill="#ffcc44" opacity="0.9" />
      <rect x="8" y="11" width="1" height="3" fill="#ffcc44" opacity="0.8" />
      <rect x="10" y="10" width="1" height="4" fill="#ffcc44" opacity="0.7" />
      {/* Impact flashes on ground */}
      <rect x="3" y="14" width="2" height="1" fill="#ff8800" opacity="0.6" />
      <rect x="6" y="15" width="2" height="1" fill="#ff8800" opacity="0.7" />
      <rect x="10" y="14" width="2" height="1" fill="#ff8800" opacity="0.5" />
    </svg>
  )
}

function MachineGunSentryIcon() {
  return (
    <svg viewBox="0 0 16 16" width="28" height="28" className="stratagem-icon" style={{ imageRendering: 'pixelated' }}>
      {/* Sentry base / tripod */}
      <rect x="6" y="13" width="4" height="1" fill="#5a6060" /> {/* base plate */}
      <rect x="5" y="12" width="1" height="2" fill="#4a5050" /> {/* left leg */}
      <rect x="10" y="12" width="1" height="2" fill="#4a5050" /> {/* right leg */}
      <rect x="7" y="11" width="2" height="2" fill="#5a6060" /> {/* center post */}
      {/* Turret body */}
      <rect x="5" y="8" width="6" height="4" fill="#6a7878" />
      <rect x="5" y="8" width="6" height="1" fill="#8a9898" opacity="0.5" /> {/* top highlight */}
      <rect x="6" y="9" width="1" height="1" fill="#3a4848" /> {/* vent left */}
      <rect x="9" y="9" width="1" height="1" fill="#3a4848" /> {/* vent right */}
      {/* Barrel */}
      <rect x="11" y="9" width="4" height="2" fill="#8a9898" />
      <rect x="11" y="9" width="4" height="1" fill="#aabcbc" opacity="0.5" /> {/* barrel shine */}
      <rect x="14" y="9" width="1" height="2" fill="#6a7878" /> {/* muzzle */}
      {/* Muzzle flash */}
      <rect x="15" y="8" width="1" height="1" fill="#ffcc44" opacity="0.9" />
      <rect x="15" y="10" width="1" height="1" fill="#ffcc44" opacity="0.9" />
      <rect x="15" y="9" width="1" height="1" fill="#ffffff" opacity="0.8" />
      {/* Sensor eye */}
      <rect x="7" y="8" width="2" height="1" fill="#ff3344" opacity="0.9" />
      <rect x="8" y="8" width="1" height="1" fill="#ff6666" opacity="0.7" /> {/* eye glow */}
      {/* Ammo belt */}
      <rect x="5" y="11" width="1" height="1" fill="#c8a020" opacity="0.6" />
      <rect x="5" y="10" width="1" height="1" fill="#c8a020" opacity="0.4" />
    </svg>
  )
}

function DefaultStratagemIcon() {
  return (
    <svg viewBox="0 0 16 16" width="28" height="28" className="stratagem-icon" style={{ imageRendering: 'pixelated' }}>
      {/* Magic star/sparkle */}
      <rect x="7" y="1" width="2" height="3" fill="#d4a540" />
      <rect x="7" y="12" width="2" height="3" fill="#d4a540" />
      <rect x="1" y="7" width="3" height="2" fill="#d4a540" />
      <rect x="12" y="7" width="3" height="2" fill="#d4a540" />
      {/* Center orb */}
      <rect x="6" y="6" width="4" height="4" fill="#d4a540" />
      <rect x="7" y="5" width="2" height="1" fill="#d4a540" />
      <rect x="7" y="10" width="2" height="1" fill="#d4a540" />
      <rect x="5" y="7" width="1" height="2" fill="#d4a540" />
      <rect x="10" y="7" width="1" height="2" fill="#d4a540" />
      {/* Inner glow */}
      <rect x="7" y="7" width="2" height="2" fill="#f0e0a0" />
      {/* Diagonal rays */}
      <rect x="4" y="4" width="1" height="1" fill="#d4a540" opacity="0.6" />
      <rect x="11" y="4" width="1" height="1" fill="#d4a540" opacity="0.6" />
      <rect x="4" y="11" width="1" height="1" fill="#d4a540" opacity="0.6" />
      <rect x="11" y="11" width="1" height="1" fill="#d4a540" opacity="0.6" />
      <rect x="3" y="3" width="1" height="1" fill="#d4a540" opacity="0.3" />
      <rect x="12" y="3" width="1" height="1" fill="#d4a540" opacity="0.3" />
    </svg>
  )
}

// Map effect_type to icon component
const STRATAGEM_ICON_MAP: Record<string, () => JSX.Element> = {
  machine_gun: MachineGunIcon,
  orbital_strike: OrbitalStrikeIcon,
  eagle_strafing: EagleStrafingIcon,
  machine_gun_sentry: MachineGunSentryIcon,
}

export function getStratagemIcon(effectType: string) {
  const Icon = STRATAGEM_ICON_MAP[effectType] ?? DefaultStratagemIcon
  return <Icon />
}
