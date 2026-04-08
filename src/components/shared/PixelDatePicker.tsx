import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string | null   // YYYY-MM-DD or null
  onChange: (date: string | null) => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function todayDateStr(): string {
  const t = new Date()
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate())
}

function formatDisplay(val: string | null): string {
  if (!val) return 'Select date...'
  const [y, m, d] = val.split('-').map(Number)
  // Use local date to avoid UTC offset shifting the displayed day
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PixelDatePicker({ value, onChange }: Props) {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(
    value ? parseInt(value.split('-')[0]) : today.getFullYear()
  )
  const [viewMonth, setViewMonth] = useState(
    value ? parseInt(value.split('-')[1]) - 1 : today.getMonth()
  )
  const containerRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside the picker
  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  function selectDay(day: number) {
    onChange(toDateStr(viewYear, viewMonth, day))
    setOpen(false)
  }

  // Build the calendar grid: leading nulls for the first weekday offset, then day numbers
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete the last row so the grid is always full rows of 7
  while (cells.length % 7 !== 0) cells.push(null)

  const todayStr = todayDateStr()

  return (
    <div ref={containerRef} className="relative">

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="pixel-input w-full text-left flex items-center justify-between gap-2"
        style={{ cursor: 'pointer' }}
      >
        <span className={`font-body text-body-base ${value ? 'text-rpg-text' : 'text-rpg-muted'}`}>
          {formatDisplay(value)}
        </span>
        <span className="text-lg flex-shrink-0">📅</span>
      </button>

      {/* Calendar popup */}
      {open && (
        <div
          className="absolute z-50 mt-1 pixel-panel p-3"
          style={{ minWidth: 240, left: 0 }}
        >
          {/* Month / year header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="pixel-btn pixel-btn-primary pixel-btn-xs">
              ◀
            </button>
            <span className="font-pixel text-pixel-xs text-rpg-gold">
              {MONTHS[viewMonth].slice(0, 3).toUpperCase()} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} className="pixel-btn pixel-btn-primary pixel-btn-xs">
              ▶
            </button>
          </div>

          {/* Day-of-week labels */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map((d) => (
              <div key={d} className="font-pixel text-center py-0.5" style={{ fontSize: 8, color: '#2d5a7a' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />

              const dateStr = toDateStr(viewYear, viewMonth, day)
              const isSelected = dateStr === value
              const isToday = dateStr === todayStr
              const isPast = dateStr < todayStr

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(day)}
                  className="font-pixel text-center py-1"
                  style={{
                    fontSize: 9,
                    lineHeight: '1.8',
                    backgroundColor: isSelected ? '#FFE710' : isToday ? '#1a3040' : 'transparent',
                    color: isSelected ? '#000000' : isPast ? '#2d4a60' : '#c8d8e4',
                    border: isToday && !isSelected ? '1px solid #2d5a7a' : '1px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t-2 border-rpg-border">
            {value ? (
              <button
                type="button"
                className="pixel-btn pixel-btn-danger pixel-btn-xs"
                onClick={() => { onChange(null); setOpen(false) }}
              >
                CLEAR
              </button>
            ) : (
              <div />
            )}
            <button
              type="button"
              className="pixel-btn pixel-btn-gold pixel-btn-xs"
              onClick={() => { onChange(todayStr); setOpen(false) }}
            >
              TODAY
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
