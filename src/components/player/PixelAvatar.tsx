// Pixel-art Helldiver space marine with idle animations
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
            .avatar-body  { animation: avatarBreathe 3s ease-in-out infinite; }
            .avatar-visor { animation: avatarBlink 5s ease-in-out infinite; }
            .avatar-cloak { animation: avatarCloakSway 4s ease-in-out infinite; transform-origin: top center; }
          `}</style>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="8" cy="15.5" rx="4" ry="0.5" fill="rgba(0,0,0,0.4)" />

        <g className="avatar-body">

          {/* ── HELMET ── */}
          {/* Top dome */}
          <rect x="5" y="0" width="6" height="1" fill="#1a2a38" />
          <rect x="4" y="1" width="8" height="1" fill="#1e3040" />
          {/* Helmet highlight */}
          <rect x="5" y="0" width="2" height="1" fill="#2d4a60" opacity="0.6" />
          <rect x="4" y="1" width="2" height="1" fill="#2d4a60" opacity="0.4" />

          {/* Visor row — glowing yellow */}
          <rect x="3" y="2" width="10" height="1" fill="#1a2a38" />
          {/* Visor inner glow */}
          <g className="avatar-visor">
            <rect x="4" y="2" width="8" height="1" fill="#FFE710" opacity="0.9" />
            {/* Visor shine */}
            <rect x="4" y="2" width="3" height="1" fill="#fff060" opacity="0.5" />
          </g>
          <rect x="3" y="3" width="10" height="1" fill="#1a2a38" />

          {/* Chin / face guard */}
          <rect x="4" y="4" width="8" height="1" fill="#162030" />
          <rect x="5" y="4" width="6" height="1" fill="#1e2c3c" />

          {/* ── COLLAR / NECK GUARD ── */}
          <rect x="5" y="5" width="6" height="1" fill="#0d1820" />

          {/* ── SHOULDER PADS ── */}
          <rect x="2" y="6" width="3" height="2" fill="#263848" />
          <rect x="11" y="6" width="3" height="2" fill="#263848" />
          {/* Shoulder highlight */}
          <rect x="2" y="6" width="2" height="1" fill="#3a5468" opacity="0.6" />
          <rect x="12" y="6" width="2" height="1" fill="#3a5468" opacity="0.6" />

          {/* ── CHEST ARMOR ── */}
          <rect x="4" y="6" width="8" height="1" fill="#1e3040" />
          <rect x="4" y="7" width="8" height="1" fill="#1a2838" />
          {/* Chest plate center device */}
          <rect x="6" y="6" width="4" height="1" fill="#263848" />
          {/* Chest emblem — Super Earth insignia */}
          <rect x="7" y="6" width="2" height="1" fill="#FFE710" opacity="0.7" />

          {/* ── UTILITY BELT ── */}
          <rect x="4" y="8" width="8" height="1" fill="#0d1820" />
          {/* Belt buckle */}
          <rect x="7" y="8" width="2" height="1" fill="#2d5a7a" />
          {/* Belt pouches */}
          <rect x="4" y="8" width="2" height="1" fill="#162028" />
          <rect x="10" y="8" width="2" height="1" fill="#162028" />

          {/* ── LOWER TORSO ── */}
          <rect x="5" y="9" width="6" height="1" fill="#1a2838" />

          {/* ── LEGS ── */}
          <rect x="4" y="10" width="3" height="1" fill="#1e2c3c" />
          <rect x="9" y="10" width="3" height="1" fill="#1e2c3c" />
          <rect x="4" y="11" width="3" height="1" fill="#162030" />
          <rect x="9" y="11" width="3" height="1" fill="#162030" />
          {/* Leg highlight */}
          <rect x="5" y="10" width="1" height="2" fill="#2d4258" opacity="0.4" />
          <rect x="10" y="10" width="1" height="2" fill="#2d4258" opacity="0.4" />

          {/* ── BOOTS ── */}
          <rect x="3" y="12" width="4" height="1" fill="#0d1820" />
          <rect x="9" y="12" width="4" height="1" fill="#0d1820" />
          <rect x="3" y="13" width="5" height="1" fill="#0a1218" />
          <rect x="8" y="13" width="5" height="1" fill="#0a1218" />
          {/* Boot toe armor */}
          <rect x="3" y="13" width="2" height="1" fill="#1e3040" />
          <rect x="11" y="13" width="2" height="1" fill="#1e3040" />

          {/* ── STRATAGEM DEVICE (left arm) ── */}
          <rect x="1" y="7" width="2" height="2" fill="#162028" />
          <rect x="1" y="7" width="2" height="1" fill="#FFE710" opacity="0.3" />
          <rect x="1" y="7" width="1" height="1" fill="#FFE710" opacity="0.5" />

          {/* ── RIFLE (right side) ── */}
          <rect x="13" y="7" width="1" height="1" fill="#2d4a60" /> {/* scope */}
          <rect x="13" y="8" width="1" height="1" fill="#1e3040" /> {/* receiver */}
          <rect x="13" y="9" width="1" height="2" fill="#0d1820" /> {/* barrel */}
          <rect x="13" y="9" width="1" height="1" fill="#3a5468" opacity="0.5" /> {/* barrel glint */}

        </g>
      </svg>
    </div>
  )
}
