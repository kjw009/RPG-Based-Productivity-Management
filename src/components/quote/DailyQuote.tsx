import { useEffect, useState } from 'react'

const QUOTES = [
  "How 'bout a nice cup of LIBER-TEA?",
  "Liberty save meeeee...",
  "Say Hello to Democracy!",
  "Become a hero, become a legend... Become, a HellDiver!",
  "Incoming friendly fire! Dodge… or don't. Your call.",
  "Together we must take back control of freedom.",
  "Hellbomber armed — clear the area.",
  "The only good bug is a dead bug.",
  "We fight for Liberty.. In HellDivers I mean!",
  "I may die in-game, but my spirit will always be on the battlefield.",
  "Teamwork makes the dream come true!",
  "I like fighting bugs!",
  "Fear is for the weak, not for those who fight for Liberty.",
  "It's not HellDivers 2, it's a managed Democracy.",
  "No matter how many times I fall, I will rise again with greater liberty.",
  "So in war, the way is to avoid what is strong and strike at what is weak.",
  "HellDivers 2 is my new companion.",
  "The ultimate test of skill and survival.",
  "HellDivers 2 taught me the value of teamwork.",
  "The ultimate test of skill and strategy – HellDivers 2.",
  "Teamwork and communication are the keys to victory.",
  "Together For Managed Democracy.",
  "Together For Liberty.",
  "Together for victory.",
  "The Only Rest You Are Going To Get Is When You Are Dead.",
  "We dive so humanity survives.",
  "Together, we can overcome any swarm. Even if it means sacrificing a few squadmates.",
  "For the Federation! And for personal glory, of course.",
  "Victory or death! Preferably victory, though.",
  "How 'bout a nice cup of LIBER-TEA???",
  "For LIBERTY!",
  "Say hello to DEMOCRACY!",
  "Freedom delivery!",
  "GET SOME!",
  "Freedom never sleeps!",
  "Liberty for ALL!",
  "Alien scumbag!",
  "FREEEEEDOOOOMMMM!",
]

const QUOTE_KEY = 'rpg_quote'

function pickRandomQuote(current: string): string {
  // Avoid repeating the same quote back-to-back.
  const pool = QUOTES.filter((q) => q !== current)
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function DailyQuote() {
  const [quote, setQuote] = useState<string>(() => {
    // Restore last quote from localStorage so it survives page refreshes.
    return localStorage.getItem(QUOTE_KEY) ?? QUOTES[0]
  })

  useEffect(() => {
    // Pick a new Helldivers quote whenever a hard task (difficulty > 3) is completed.
    function handleHardTask() {
      const next = pickRandomQuote(quote)
      localStorage.setItem(QUOTE_KEY, next)
      setQuote(next)
    }

    window.addEventListener('hard-task-complete', handleHardTask)
    return () => window.removeEventListener('hard-task-complete', handleHardTask)
  }, [quote])

  return (
    <div className="notice-board px-3 py-2 mb-2">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 flex flex-col gap-0.5 pt-0.5">
          <span className="font-pixel text-pixel-xs" style={{ color: '#FFE710', fontSize: 7, letterSpacing: '0.1em' }}>
            INTEL
          </span>
        </div>
        <blockquote className="font-grimoire text-grimoire-base leading-snug min-w-0 italic" style={{ color: '#c8d8e4' }}>
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>
    </div>
  )
}
