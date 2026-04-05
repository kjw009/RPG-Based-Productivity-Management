// CSS pixel art character sprite using box-shadows
// Each "pixel" is 4×4. The shadow list draws a tiny RPG rogue.
export default function PixelAvatar() {
  return (
    <div className="flex items-center justify-center" style={{ width: 64, height: 64 }}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 12 12"
        xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Hood / hair */}
        <rect x="3" y="0" width="6" height="1" fill="#2d1b69" />
        <rect x="2" y="1" width="8" height="1" fill="#2d1b69" />
        {/* Face */}
        <rect x="3" y="2" width="6" height="3" fill="#f5c5a3" />
        {/* Eyes */}
        <rect x="4" y="3" width="1" height="1" fill="#1a0a2e" />
        <rect x="7" y="3" width="1" height="1" fill="#1a0a2e" />
        {/* Cloak collar */}
        <rect x="2" y="5" width="8" height="1" fill="#2d1b69" />
        {/* Body / cloak */}
        <rect x="1" y="6" width="10" height="4" fill="#3b2480" />
        {/* Belt */}
        <rect x="2" y="7" width="8" height="1" fill="#92400e" />
        {/* Belt buckle */}
        <rect x="5" y="7" width="2" height="1" fill="#fbbf24" />
        {/* Legs */}
        <rect x="3" y="10" width="2" height="2" fill="#1e1b4b" />
        <rect x="7" y="10" width="2" height="2" fill="#1e1b4b" />
        {/* Boots */}
        <rect x="2" y="11" width="3" height="1" fill="#44403c" />
        <rect x="7" y="11" width="3" height="1" fill="#44403c" />
        {/* Dagger */}
        <rect x="10" y="6" width="1" height="3" fill="#94a3b8" />
        <rect x="10" y="5" width="1" height="1" fill="#fbbf24" />
      </svg>
    </div>
  )
}
