// Detailed pixel-art SVG icons for each ability

function PickpocketIcon() {
  return (
    <svg viewBox="0 0 16 16" width="28" height="28" className="ability-icon" style={{ imageRendering: 'pixelated' }}>
      {/* Hand reaching into coin purse */}
      <rect x="4" y="2" width="8" height="6" rx="0" fill="#6a4a10" /> {/* purse body */}
      <rect x="5" y="1" width="6" height="1" fill="#8a6a18" /> {/* purse rim */}
      <rect x="6" y="0" width="4" height="1" fill="#5a3a08" /> {/* drawstring */}
      <rect x="7" y="3" width="2" height="2" fill="#d4a540" /> {/* coin showing */}
      <rect x="7" y="3" width="1" height="1" fill="#f0d080" opacity="0.6" /> {/* coin shine */}
      {/* Sneaky hand */}
      <rect x="2" y="6" width="2" height="1" fill="#e8b88a" />
      <rect x="3" y="5" width="2" height="1" fill="#e8b88a" />
      <rect x="4" y="4" width="1" height="2" fill="#e8b88a" />
      {/* Sparkles */}
      <rect x="12" y="1" width="1" height="1" fill="#d4a540" opacity="0.8" />
      <rect x="13" y="3" width="1" height="1" fill="#d4a540" opacity="0.5" />
      <rect x="11" y="4" width="1" height="1" fill="#d4a540" opacity="0.6" />
      {/* Shadow */}
      <rect x="5" y="9" width="6" height="1" fill="rgba(0,0,0,0.2)" />
    </svg>
  )
}

function ShadowStepIcon() {
  return (
    <svg viewBox="0 0 16 16" width="28" height="28" className="ability-icon" style={{ imageRendering: 'pixelated' }}>
      {/* Ghost / shadow figure */}
      <rect x="6" y="1" width="4" height="1" fill="#4a3a6e" opacity="0.7" />
      <rect x="5" y="2" width="6" height="2" fill="#3a2a5e" opacity="0.6" />
      {/* Shadow eyes */}
      <rect x="6" y="3" width="1" height="1" fill="#8a7aee" />
      <rect x="9" y="3" width="1" height="1" fill="#8a7aee" />
      {/* Body fading */}
      <rect x="4" y="4" width="8" height="2" fill="#3a2a5e" opacity="0.5" />
      <rect x="3" y="6" width="10" height="2" fill="#2a1a4e" opacity="0.4" />
      <rect x="2" y="8" width="12" height="2" fill="#1a0a3e" opacity="0.3" />
      <rect x="1" y="10" width="14" height="2" fill="#1a0a3e" opacity="0.15" />
      {/* Footprints dissolving */}
      <rect x="4" y="13" width="2" height="1" fill="#2a1a4e" opacity="0.3" />
      <rect x="9" y="14" width="2" height="1" fill="#2a1a4e" opacity="0.2" />
      {/* Magic particles */}
      <rect x="2" y="2" width="1" height="1" fill="#8a7aee" opacity="0.5" />
      <rect x="13" y="4" width="1" height="1" fill="#8a7aee" opacity="0.4" />
      <rect x="1" y="6" width="1" height="1" fill="#8a7aee" opacity="0.3" />
    </svg>
  )
}

function SmokeBombIcon() {
  return (
    <svg viewBox="0 0 16 16" width="28" height="28" className="ability-icon" style={{ imageRendering: 'pixelated' }}>
      {/* Bomb body */}
      <rect x="6" y="8" width="4" height="4" fill="#3a3a3a" />
      <rect x="5" y="9" width="6" height="2" fill="#2a2a2a" />
      <rect x="7" y="8" width="1" height="1" fill="#5a5a5a" opacity="0.5" /> {/* shine */}
      {/* Fuse */}
      <rect x="8" y="6" width="1" height="2" fill="#8a6a18" />
      <rect x="9" y="5" width="1" height="1" fill="#8a6a18" />
      {/* Fuse spark */}
      <rect x="9" y="4" width="1" height="1" fill="#ff8844" />
      <rect x="10" y="3" width="1" height="1" fill="#ffaa44" opacity="0.7" />
      {/* Smoke clouds billowing */}
      <rect x="3" y="2" width="3" height="2" fill="#8a8a8a" opacity="0.4" />
      <rect x="2" y="1" width="4" height="2" fill="#9a9a9a" opacity="0.3" />
      <rect x="8" y="1" width="4" height="2" fill="#8a8a8a" opacity="0.35" />
      <rect x="10" y="3" width="3" height="2" fill="#7a7a7a" opacity="0.3" />
      <rect x="1" y="3" width="3" height="2" fill="#7a7a7a" opacity="0.25" />
      <rect x="4" y="0" width="3" height="1" fill="#aaaaaa" opacity="0.2" />
      {/* Ground shadow */}
      <rect x="4" y="13" width="8" height="1" fill="rgba(0,0,0,0.2)" />
    </svg>
  )
}

function BackstabIcon() {
  return (
    <svg viewBox="0 0 16 16" width="28" height="28" className="ability-icon" style={{ imageRendering: 'pixelated' }}>
      {/* Dagger — ornate */}
      {/* Blade */}
      <rect x="3" y="2" width="1" height="7" fill="#c0d0e0" />
      <rect x="4" y="2" width="1" height="7" fill="#a0b0c0" />
      {/* Blade tip */}
      <rect x="3" y="1" width="2" height="1" fill="#d0e0f0" />
      <rect x="3" y="0" width="1" height="1" fill="#e0f0ff" />
      {/* Blade edge shine */}
      <rect x="3" y="3" width="1" height="1" fill="#e0f0ff" opacity="0.5" />
      <rect x="3" y="5" width="1" height="1" fill="#e0f0ff" opacity="0.3" />
      {/* Guard — ornate crossguard */}
      <rect x="1" y="9" width="6" height="1" fill="#d4a540" />
      <rect x="2" y="10" width="4" height="1" fill="#b8942a" />
      {/* Guard gems */}
      <rect x="1" y="9" width="1" height="1" fill="#c93030" />
      <rect x="6" y="9" width="1" height="1" fill="#c93030" />
      {/* Grip */}
      <rect x="3" y="11" width="2" height="2" fill="#5a2a08" />
      <rect x="3" y="11" width="1" height="1" fill="#6a3a18" opacity="0.5" /> {/* grip highlight */}
      {/* Pommel */}
      <rect x="3" y="13" width="2" height="1" fill="#d4a540" />
      {/* Blood drops */}
      <rect x="7" y="3" width="1" height="1" fill="#c93030" opacity="0.8" />
      <rect x="8" y="5" width="1" height="1" fill="#c93030" opacity="0.6" />
      <rect x="9" y="4" width="1" height="2" fill="#c93030" opacity="0.4" />
      {/* Impact lines */}
      <rect x="6" y="1" width="2" height="1" fill="#d4a540" opacity="0.4" />
      <rect x="7" y="2" width="3" height="1" fill="#d4a540" opacity="0.3" />
      {/* Speed lines */}
      <rect x="10" y="6" width="3" height="1" fill="#d8ccb4" opacity="0.2" />
      <rect x="11" y="8" width="2" height="1" fill="#d8ccb4" opacity="0.15" />
    </svg>
  )
}

function DefaultAbilityIcon() {
  return (
    <svg viewBox="0 0 16 16" width="28" height="28" className="ability-icon" style={{ imageRendering: 'pixelated' }}>
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
const ABILITY_ICON_MAP: Record<string, () => JSX.Element> = {
  pickpocket: PickpocketIcon,
  shadow_step: ShadowStepIcon,
  smoke_bomb: SmokeBombIcon,
  backstab: BackstabIcon,
}

export function getAbilityIcon(effectType: string) {
  const Icon = ABILITY_ICON_MAP[effectType] ?? DefaultAbilityIcon
  return <Icon />
}
