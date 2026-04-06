// Detailed pixel-art rogue character with idle animations
export default function PixelAvatar() {
  return (
    <div className="relative" style={{ width: 80, height: 80 }}>
      <svg
        width="80"
        height="80"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: 'pixelated' }}
      >
        <defs>
          <style>{`
            .avatar-body { animation: avatarBreathe 3s ease-in-out infinite; }
            .avatar-eyes { animation: avatarBlink 4s ease-in-out infinite; }
            .avatar-cloak { animation: avatarCloakSway 4s ease-in-out infinite; transform-origin: top center; }
          `}</style>
        </defs>

        {/* Shadow on ground */}
        <ellipse cx="8" cy="15.5" rx="4" ry="0.5" fill="rgba(0,0,0,0.3)" />

        <g className="avatar-body">
          {/* Hood — dark purple with highlights */}
          <rect x="4" y="0" width="8" height="1" fill="#2d1b69" />
          <rect x="3" y="1" width="10" height="1" fill="#2d1b69" />
          <rect x="3" y="2" width="10" height="1" fill="#231456" />
          {/* Hood highlight */}
          <rect x="5" y="0" width="2" height="1" fill="#3d2b7a" opacity="0.6" />
          <rect x="4" y="1" width="2" height="1" fill="#3d2b7a" opacity="0.4" />

          {/* Face — skin tones with shading */}
          <rect x="4" y="3" width="8" height="3" fill="#e8b88a" />
          {/* Forehead shadow from hood */}
          <rect x="4" y="3" width="8" height="1" fill="#d4a070" />
          {/* Cheek highlight */}
          <rect x="5" y="4" width="1" height="1" fill="#f0c8a0" />
          <rect x="10" y="4" width="1" height="1" fill="#f0c8a0" />
          {/* Nose shadow */}
          <rect x="7" y="5" width="2" height="1" fill="#d4a070" />

          {/* Eyes — with animated blink */}
          <g className="avatar-eyes">
            <rect x="5" y="4" width="2" height="1" fill="#1a0a2e" />
            <rect x="9" y="4" width="2" height="1" fill="#1a0a2e" />
            {/* Eye shine */}
            <rect x="5" y="4" width="1" height="1" fill="#4a3a6e" opacity="0.6" />
            <rect x="9" y="4" width="1" height="1" fill="#4a3a6e" opacity="0.6" />
          </g>

          {/* Mouth */}
          <rect x="7" y="5" width="2" height="1" fill="#c08060" opacity="0.5" />

          {/* Scarf / collar */}
          <rect x="3" y="6" width="10" height="1" fill="#8b1a1a" />
          <rect x="4" y="6" width="2" height="1" fill="#a02020" />

          {/* Cloak — with sway animation */}
          <g className="avatar-cloak">
            <rect x="2" y="7" width="12" height="1" fill="#3b2480" />
            <rect x="2" y="8" width="12" height="1" fill="#2d1b69" />
            <rect x="2" y="9" width="12" height="1" fill="#3b2480" />
            <rect x="2" y="10" width="12" height="1" fill="#2d1b69" />
            {/* Cloak highlight (left fold) */}
            <rect x="3" y="7" width="1" height="4" fill="#4a30a0" opacity="0.4" />
            {/* Cloak shadow (right fold) */}
            <rect x="12" y="7" width="1" height="4" fill="#1a0a40" opacity="0.4" />
            {/* Cloak bottom trim */}
            <rect x="2" y="10" width="12" height="1" fill="#231456" />
          </g>

          {/* Belt with ornate buckle */}
          <rect x="3" y="8" width="10" height="1" fill="#6a4a10" />
          <rect x="6" y="8" width="4" height="1" fill="#8a6a18" />
          {/* Buckle gem */}
          <rect x="7" y="8" width="2" height="1" fill="#d4a540" />

          {/* Pouches on belt */}
          <rect x="4" y="8" width="2" height="1" fill="#5a3a08" />
          <rect x="10" y="8" width="2" height="1" fill="#5a3a08" />

          {/* Legs with shading */}
          <rect x="4" y="11" width="3" height="2" fill="#1e1b4b" />
          <rect x="9" y="11" width="3" height="2" fill="#1e1b4b" />
          {/* Leg highlights */}
          <rect x="5" y="11" width="1" height="2" fill="#2a2660" opacity="0.5" />
          <rect x="10" y="11" width="1" height="2" fill="#2a2660" opacity="0.5" />

          {/* Boots — detailed */}
          <rect x="3" y="13" width="4" height="1" fill="#4a3a28" />
          <rect x="9" y="13" width="4" height="1" fill="#4a3a28" />
          {/* Boot soles */}
          <rect x="3" y="14" width="4" height="1" fill="#3a2a18" />
          <rect x="9" y="14" width="4" height="1" fill="#3a2a18" />
          {/* Boot buckles */}
          <rect x="4" y="13" width="1" height="1" fill="#8a6a18" />
          <rect x="10" y="13" width="1" height="1" fill="#8a6a18" />

          {/* Dagger on hip — with hilt detail */}
          <rect x="13" y="7" width="1" height="1" fill="#d4a540" /> {/* pommel */}
          <rect x="13" y="8" width="1" height="1" fill="#8a6a18" /> {/* grip */}
          <rect x="13" y="9" width="1" height="1" fill="#d4a540" /> {/* guard */}
          <rect x="13" y="10" width="1" height="2" fill="#a0b0c0" /> {/* blade */}
          <rect x="13" y="10" width="1" height="1" fill="#c0d0e0" opacity="0.6" /> {/* blade shine */}

          {/* Shoulder pauldron */}
          <rect x="2" y="7" width="2" height="1" fill="#5a3a08" />
          <rect x="2" y="7" width="1" height="1" fill="#8a6a18" opacity="0.5" />
        </g>
      </svg>
    </div>
  )
}
