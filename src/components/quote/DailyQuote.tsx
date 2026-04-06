import { useEffect, useState } from 'react'
import { todayStr } from '../../lib/gameRules'

const FALLBACK_QUOTES = [
  { content: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { content: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { content: 'Our greatest glory is not in never falling, but in rising every time we fall.', author: 'Confucius' },
  { content: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { content: 'Hard work beats talent when talent doesn\'t work hard.', author: 'Tim Notke' },
  { content: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { content: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { content: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
  { content: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
  { content: 'You don\'t have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
  { content: 'It always seems impossible until it\'s done.', author: 'Nelson Mandela' },
  { content: 'What you get by achieving your goals is not as important as what you become.', author: 'Thoreau' },
  { content: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
  { content: 'You miss 100% of the shots you don\'t take.', author: 'Wayne Gretzky' },
  { content: 'Whether you think you can or you think you can\'t, you\'re right.', author: 'Henry Ford' },
  { content: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
  { content: 'Tough times never last, but tough people do.', author: 'Robert H. Schuller' },
  { content: 'The harder the conflict, the greater the triumph.', author: 'George Washington' },
  { content: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin' },
  { content: 'Act as if what you do makes a difference. It does.', author: 'William James' },
  { content: 'Success usually comes to those who are too busy to be looking for it.', author: 'Henry David Thoreau' },
  { content: 'Don\'t be afraid to give up the good to go for the great.', author: 'John D. Rockefeller' },
  { content: 'I find that the harder I work, the more luck I seem to have.', author: 'Thomas Jefferson' },
  { content: 'The only limit to our realization of tomorrow is our doubts of today.', author: 'FDR' },
  { content: 'You are never too old to set another goal or to dream a new dream.', author: 'C.S. Lewis' },
  { content: 'People who are crazy enough to think they can change the world, are the ones who do.', author: 'Rob Siltanen' },
  { content: 'Failure will never overtake me if my determination to succeed is strong enough.', author: 'Og Mandino' },
  { content: 'We may encounter many defeats but we must not be defeated.', author: 'Maya Angelou' },
  { content: 'Knowing is not enough; we must apply. Wishing is not enough; we must do.', author: 'Johann Wolfgang von Goethe' },
  { content: 'Imagine your life is perfect in every respect; what would it look like?', author: 'Brian Tracy' },
]

const QUOTE_KEY = 'rpg_daily_quote'
const QUOTE_DATE_KEY = 'rpg_daily_quote_date'

interface Quote { content: string; author: string }

function getFallbackQuote(): Quote {
  // Deterministic rotation keeps the offline quote stable for the whole day.
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return FALLBACK_QUOTES[dayOfYear % FALLBACK_QUOTES.length]
}

export default function DailyQuote() {
  const [quote, setQuote] = useState<Quote | null>(null)

  useEffect(() => {
    const today = todayStr()
    const cached = localStorage.getItem(QUOTE_KEY)
    const cachedDate = localStorage.getItem(QUOTE_DATE_KEY)

    // Reuse today's quote so the card does not change on every refresh.
    if (cached && cachedDate === today) {
      setQuote(JSON.parse(cached))
      return
    }

    // Fetch once per day, then fall back to the built-in rotation if the API
    // is unavailable or blocked.
    fetch('https://api.quotable.io/random?maxLength=120')
      .then((r) => r.json())
      .then((data) => {
        const q: Quote = { content: data.content, author: data.author }
        localStorage.setItem(QUOTE_KEY, JSON.stringify(q))
        localStorage.setItem(QUOTE_DATE_KEY, today)
        setQuote(q)
      })
      .catch(() => {
        const q = getFallbackQuote()
        localStorage.setItem(QUOTE_KEY, JSON.stringify(q))
        localStorage.setItem(QUOTE_DATE_KEY, today)
        setQuote(q)
      })
  }, [])

  if (!quote) return null

  return (
    <div className="notice-board px-3 py-2 mb-2">
      <div className="flex items-baseline gap-2">
        <span className="text-rpg-gold flex-shrink-0 text-sm opacity-60">✦</span>
        <blockquote className="font-grimoire text-grimoire-base leading-snug min-w-0 italic">
          &ldquo;{quote.content}&rdquo; <cite className="not-italic opacity-60">— {quote.author}</cite>
        </blockquote>
      </div>
    </div>
  )
}
