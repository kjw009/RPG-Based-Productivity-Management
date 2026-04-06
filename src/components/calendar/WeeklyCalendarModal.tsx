import { useState, useMemo, useEffect, useCallback } from 'react'
import PixelButton from '../shared/PixelButton'
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar'
import type { GCalEvent } from '../../hooks/useGoogleCalendar'
import type { Todo, Project } from '../../types'

interface ScheduledBlock {
  todoId: string
  date: string              // YYYY-MM-DD — absolute, survives across sessions
  startHour: number
  durationHours: number
  gcalEventId?: string
  dirty?: boolean
}

interface Props {
  mode: 'schedule' | 'view'
  todos: Todo[]
  projects: Map<string, Project>
  onClose: () => void
}

const STORAGE_KEY = 'rpg_quest_blocks'
const REMOVED_KEY = 'rpg_quest_blocks_removed'

const CELL_H = 48
const START_HOUR = 6
const END_HOUR = 22
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR)
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DIFF_COLORS: Record<number, string> = {
  1: '#22c55e',
  2: '#3b82f6',
  3: '#eab308',
  4: '#f97316',
  5: '#ef4444',
}

function getWeekDates(offset: number): Date[] {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  start.setDate(start.getDate() - start.getDay() + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function formatHour(h: number): string {
  const whole = Math.floor(h)
  const mins = Math.round((h % 1) * 60)
  const suffix = whole >= 12 ? 'PM' : 'AM'
  const display = whole > 12 ? whole - 12 : whole === 0 ? 12 : whole
  return mins > 0 ? `${display}:${String(mins).padStart(2, '0')}${suffix}` : `${display}${suffix}`
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseGCalEventPosition(
  event: GCalEvent,
  weekDates: Date[],
): { dayIndex: number; startHour: number; durationHours: number } | null {
  if (event.allDay) return null
  const start = new Date(event.start)
  const end = new Date(event.end)
  const startDateStr = toDateStr(start)
  const dayIndex = weekDates.findIndex(d => toDateStr(d) === startDateStr)
  if (dayIndex === -1) return null
  const startHour = start.getHours() + start.getMinutes() / 60
  const endHour = end.getHours() + end.getMinutes() / 60
  const durationHours = Math.max(0.25, endHour - startHour)
  return { dayIndex, startHour, durationHours }
}

// ─── Persistence helpers ───

function loadBlocks(): ScheduledBlock[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveBlocks(blocks: ScheduledBlock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks))
}

function loadRemovedIds(): string[] {
  try {
    const raw = localStorage.getItem(REMOVED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRemovedIds(ids: string[]) {
  if (ids.length === 0) {
    localStorage.removeItem(REMOVED_KEY)
  } else {
    localStorage.setItem(REMOVED_KEY, JSON.stringify(ids))
  }
}

// ─── Component ───

export default function WeeklyCalendarModal({ mode, todos, projects, onClose }: Props) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [blocks, setBlocks] = useState<ScheduledBlock[]>(loadBlocks)
  const [dragId, setDragId] = useState<string | null>(null)
  const [hoverCell, setHoverCell] = useState<string | null>(null)
  const [showSyncSummary, setShowSyncSummary] = useState(false)
  const [syncDone, setSyncDone] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [removedEventIds, setRemovedEventIds] = useState<string[]>(loadRemovedIds)

  const gcal = useGoogleCalendar()

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])
  const weekDateStrs = useMemo(() => weekDates.map(toDateStr), [weekDates])
  const todayStr = toDateStr(new Date())
  const now = new Date()
  const currentHourFrac = now.getHours() + now.getMinutes() / 60
  const currentDayIdx = now.getDay()
  const isCurrentWeek = weekOffset === 0

  // Persist blocks to localStorage on every change
  useEffect(() => { saveBlocks(blocks) }, [blocks])
  useEffect(() => { saveRemovedIds(removedEventIds) }, [removedEventIds])

  // Fetch Google Calendar events when week changes or sign-in changes
  useEffect(() => {
    if (!gcal.isSignedIn) return
    const timeMin = weekDates[0].toISOString()
    const endDate = new Date(weekDates[6])
    endDate.setDate(endDate.getDate() + 1)
    gcal.fetchEvents(timeMin, endDate.toISOString())
  }, [weekOffset, gcal.isSignedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  // IDs of gcal events managed by our quest blocks — hide from the gcal layer
  const managedGCalIds = useMemo(() => {
    const ids = new Set<string>()
    for (const b of blocks) {
      if (b.gcalEventId) ids.add(b.gcalEventId)
    }
    return ids
  }, [blocks])

  // Gcal events for this week (excluding managed ones)
  const gcalBlocks = useMemo(() => {
    const result: { event: GCalEvent; dayIndex: number; startHour: number; durationHours: number }[] = []
    for (const ev of gcal.events) {
      if (managedGCalIds.has(ev.id)) continue
      const pos = parseGCalEventPosition(ev, weekDates)
      if (pos) result.push({ event: ev, ...pos })
    }
    return result
  }, [gcal.events, weekDates, managedGCalIds])

  // All-day gcal events grouped by date string
  const allDayEvents = useMemo(() => {
    const m = new Map<string, GCalEvent[]>()
    for (const ev of gcal.events) {
      if (!ev.allDay) continue
      const ds = ev.start.slice(0, 10)
      const arr = m.get(ds) || []
      arr.push(ev)
      m.set(ds, arr)
    }
    return m
  }, [gcal.events])

  // Blocks visible this week
  const weekBlocks = useMemo(
    () => blocks.filter(b => weekDateStrs.includes(b.date)),
    [blocks, weekDateStrs],
  )

  const activeTodos = useMemo(() => todos.filter(t => !t.completed), [todos])
  const scheduledIds = new Set(blocks.map(b => b.todoId))
  const unscheduled = activeTodos.filter(t => !scheduledIds.has(t.id))

  // View mode: group todos by due date string
  const todosByDate = useMemo(() => {
    const m = new Map<string, Todo[]>()
    activeTodos.forEach(t => {
      if (t.due_date) {
        const arr = m.get(t.due_date) || []
        arr.push(t)
        m.set(t.due_date, arr)
      }
    })
    return m
  }, [activeTodos])

  const weekLabel = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  // ─── Drag & drop ───

  function handleDragStart(todoId: string) {
    setDragId(todoId)
  }

  function handleDragEnd() {
    setDragId(null)
    setHoverCell(null)
  }

  function handleDrop(dayIndex: number, hour: number) {
    if (!dragId) return
    const dateStr = weekDateStrs[dayIndex]
    setBlocks(prev => {
      const existing = prev.find(b => b.todoId === dragId)
      return [
        ...prev.filter(b => b.todoId !== dragId),
        {
          todoId: dragId,
          date: dateStr,
          startHour: hour,
          durationHours: existing?.durationHours ?? 1,
          gcalEventId: existing?.gcalEventId,
          dirty: !!existing?.gcalEventId,
        },
      ]
    })
    setDragId(null)
    setHoverCell(null)
  }

  function removeBlock(todoId: string) {
    const block = blocks.find(b => b.todoId === todoId)
    if (block?.gcalEventId) {
      setRemovedEventIds(prev => [...prev, block.gcalEventId!])
    }
    setBlocks(prev => prev.filter(b => b.todoId !== todoId))
  }

  function adjustDuration(todoId: string, delta: number) {
    setBlocks(prev =>
      prev.map(b =>
        b.todoId === todoId
          ? {
              ...b,
              durationHours: Math.max(0.5, Math.min(4, b.durationHours + delta)),
              dirty: !!b.gcalEventId,
            }
          : b,
      ),
    )
  }

  // ─── Sync ───

  const blocksToSync = blocks.filter(b => !b.gcalEventId || b.dirty)
  const hasChanges = blocksToSync.length > 0 || removedEventIds.length > 0

  function handleDone() {
    setShowSyncSummary(true)
  }

  const blockToDateTimes = useCallback((block: ScheduledBlock) => {
    const [y, m, d] = block.date.split('-').map(Number)
    const startDt = new Date(y, m - 1, d)
    startDt.setHours(Math.floor(block.startHour), Math.round((block.startHour % 1) * 60), 0, 0)
    const endDt = new Date(startDt)
    endDt.setMinutes(endDt.getMinutes() + Math.round(block.durationHours * 60))
    return { startISO: startDt.toISOString(), endISO: endDt.toISOString() }
  }, [])

  async function syncToGoogleCalendar() {
    if (!gcal.isSignedIn) {
      gcal.signIn()
      return
    }
    setSyncing(true)
    setSyncProgress(0)
    setSyncError(null)

    let completed = 0

    try {
      // Delete removed synced blocks from Google Calendar
      for (const eventId of removedEventIds) {
        await gcal.deleteEvent(eventId)
        completed++
        setSyncProgress(completed)
      }

      // Create or update blocks
      const updatedBlocks = [...blocks]
      for (let i = 0; i < updatedBlocks.length; i++) {
        const block = updatedBlocks[i]
        if (block.gcalEventId && !block.dirty) continue

        const todo = todos.find(t => t.id === block.todoId)
        if (!todo) continue

        const { startISO, endISO } = blockToDateTimes(block)

        if (block.gcalEventId && block.dirty) {
          await gcal.updateEvent(
            block.gcalEventId,
            todo.title,
            startISO,
            endISO,
            todo.description || undefined,
          )
          updatedBlocks[i] = { ...block, dirty: false }
        } else {
          const eventId = await gcal.createEvent(
            todo.title,
            startISO,
            endISO,
            todo.description || undefined,
          )
          updatedBlocks[i] = { ...block, gcalEventId: eventId, dirty: false }
        }
        completed++
        setSyncProgress(completed)
      }

      setBlocks(updatedBlocks)
      setRemovedEventIds([])
      setSyncDone(true)

      // Refresh calendar events
      const timeMin = weekDates[0].toISOString()
      const endDate = new Date(weekDates[6])
      endDate.setDate(endDate.getDate() + 1)
      gcal.fetchEvents(timeMin, endDate.toISOString())
    } catch (err: any) {
      const msg = err?.result?.error?.message || err?.message || 'Failed to sync events'
      setSyncError(msg)
      if (err?.status === 401 || err?.status === 403) {
        localStorage.removeItem('gcal_token')
        window.gapi?.client?.setToken?.(null)
        gcal.signOut()
        setSyncError('Permission denied. Please reconnect Google Calendar to grant write access.')
      }
      setSyncing(false)
      return
    }
    setSyncing(false)
  }

  // ─── Render helpers ───

  function renderGCalConnectBar() {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border-b border-rpg-border/50 flex-shrink-0 bg-rpg-bg/80">
        {gcal.isSignedIn ? (
          <>
            <span className="font-body text-body-sm text-rpg-green">● Connected to Google Calendar</span>
            {gcal.loading && <span className="font-body text-body-sm text-rpg-muted animate-blink">Fetching...</span>}
            <PixelButton size="xs" variant="primary" onClick={() => {
              const timeMin = weekDates[0].toISOString()
              const endDate = new Date(weekDates[6])
              endDate.setDate(endDate.getDate() + 1)
              gcal.fetchEvents(timeMin, endDate.toISOString())
            }}>
              ↻ Refresh
            </PixelButton>
            <PixelButton size="xs" variant="danger" onClick={gcal.signOut}>
              Disconnect
            </PixelButton>
          </>
        ) : (
          <>
            <span className="font-body text-body-sm text-rpg-muted">○ Google Calendar not connected</span>
            <PixelButton size="xs" variant="gold" onClick={gcal.signIn}>
              Connect Google Calendar
            </PixelButton>
          </>
        )}
        {gcal.error && <span className="font-body text-body-sm text-rpg-hp">{gcal.error}</span>}
      </div>
    )
  }

  function renderDayHeader(date: Date, idx: number) {
    const ds = toDateStr(date)
    const isToday = ds === todayStr
    const dayAllDay = allDayEvents.get(ds) || []
    return (
      <div
        key={idx}
        className={`flex-1 text-center border-b-2 border-rpg-border font-grimoire text-grimoire-sm ${isToday ? 'text-rpg-gold' : 'text-rpg-muted'}`}
      >
        <div className="py-2">
          <div>{DAY_NAMES[date.getDay()]}</div>
          <div className={`text-lg ${isToday ? 'font-bold' : ''}`}>{date.getDate()}</div>
        </div>
        {dayAllDay.length > 0 && (
          <div className="px-1 pb-1 space-y-0.5">
            {dayAllDay.map(ev => (
              <div key={ev.id} className="calendar-gcal-allday truncate">
                {ev.summary}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  function renderGCalBlocks(dayIdx: number) {
    return gcalBlocks
      .filter(b => b.dayIndex === dayIdx)
      .map(({ event, startHour, durationHours }) => {
        const clampedStart = Math.max(startHour, START_HOUR)
        const clampedEnd = Math.min(startHour + durationHours, END_HOUR + 1)
        if (clampedStart >= clampedEnd) return null
        return (
          <div
            key={event.id}
            className="calendar-gcal-block"
            title={`${event.summary}\n${formatHour(startHour)}–${formatHour(startHour + durationHours)}`}
            style={{
              top: (clampedStart - START_HOUR) * CELL_H + 1,
              height: (clampedEnd - clampedStart) * CELL_H - 2,
            }}
          >
            <span className="truncate font-body text-body-sm leading-tight">{event.summary}</span>
            <span className="font-body text-xs opacity-70">
              {formatHour(startHour)}–{formatHour(startHour + durationHours)}
            </span>
          </div>
        )
      })
  }

  function renderQuestBlocks(dayIdx: number) {
    const dateStr = weekDateStrs[dayIdx]
    return weekBlocks
      .filter(b => b.date === dateStr)
      .map(block => {
        const todo = todos.find(t => t.id === block.todoId)
        if (!todo) return null
        const color = DIFF_COLORS[todo.difficulty] || '#6b7280'
        return (
          <div
            key={block.todoId}
            className="calendar-block"
            draggable
            onDragStart={() => handleDragStart(block.todoId)}
            onDragEnd={handleDragEnd}
            style={{
              top: (block.startHour - START_HOUR) * CELL_H + 1,
              height: block.durationHours * CELL_H - 2,
              backgroundColor: color + '25',
              borderLeftColor: color,
            }}
          >
            <div className="flex items-center gap-1">
              {block.gcalEventId && !block.dirty && (
                <span className="text-rpg-green text-xs flex-shrink-0" title="Synced">✓</span>
              )}
              {block.gcalEventId && block.dirty && (
                <span className="text-rpg-amber text-xs flex-shrink-0" title="Modified">●</span>
              )}
              <span className="truncate font-body text-body-sm text-rpg-text leading-tight">
                {todo.title}
              </span>
            </div>
            <div className="calendar-block-controls">
              <button onClick={e => { e.stopPropagation(); adjustDuration(block.todoId, -0.5) }} title="Shrink">−</button>
              <button onClick={e => { e.stopPropagation(); adjustDuration(block.todoId, 0.5) }} title="Extend">+</button>
              <button onClick={e => { e.stopPropagation(); removeBlock(block.todoId) }} title="Remove">✕</button>
            </div>
          </div>
        )
      })
  }

  function renderCurrentTimeLine(dayIdx: number) {
    if (!isCurrentWeek || dayIdx !== currentDayIdx) return null
    if (currentHourFrac < START_HOUR || currentHourFrac > END_HOUR) return null
    return (
      <div
        className="absolute left-0 right-0 z-20 pointer-events-none"
        style={{ top: (currentHourFrac - START_HOUR) * CELL_H }}
      >
        <div className="border-t-2 border-rpg-hp relative">
          <div className="absolute -top-[5px] -left-[5px] w-[10px] h-[10px] rounded-full bg-rpg-hp" />
        </div>
      </div>
    )
  }

  function renderTimeGrid() {
    return (
      <div className="flex-1 overflow-auto calendar-scroll">
        <div className="flex sticky top-0 z-10 bg-rpg-bg">
          <div className="flex-shrink-0" style={{ width: 56 }} />
          {weekDates.map((date, i) => renderDayHeader(date, i))}
        </div>
        <div className="flex relative">
          <div className="flex-shrink-0" style={{ width: 56 }}>
            {HOURS.map(h => (
              <div key={h} className="font-body text-body-sm text-rpg-muted text-right pr-2 flex items-start justify-end" style={{ height: CELL_H }}>
                <span className="mt-[-6px]">{formatHour(h)}</span>
              </div>
            ))}
          </div>
          {weekDates.map((date, dayIdx) => {
            const isToday = toDateStr(date) === todayStr
            return (
              <div key={dayIdx} className={`flex-1 relative ${isToday ? 'bg-rpg-gold/[0.03]' : ''}`} style={{ height: HOURS.length * CELL_H }}>
                {HOURS.map(h => (
                  <div
                    key={h}
                    className={`absolute left-0 right-0 calendar-hour-cell ${hoverCell === `${dayIdx}-${h}` ? 'calendar-cell-hover' : ''}`}
                    style={{ top: (h - START_HOUR) * CELL_H, height: CELL_H }}
                    onDragOver={e => { e.preventDefault(); setHoverCell(`${dayIdx}-${h}`) }}
                    onDragLeave={() => setHoverCell(null)}
                    onDrop={e => { e.preventDefault(); handleDrop(dayIdx, h) }}
                  >
                    <div className="absolute left-0 right-0 border-b border-rpg-border/10" style={{ top: CELL_H / 2 }} />
                  </div>
                ))}
                {renderGCalBlocks(dayIdx)}
                {renderQuestBlocks(dayIdx)}
                {renderCurrentTimeLine(dayIdx)}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function renderViewMode() {
    return (
      <div className="flex-1 overflow-auto calendar-scroll">
        <div className="flex sticky top-0 z-10 bg-rpg-bg">
          {weekDates.map((date, i) => renderDayHeader(date, i))}
        </div>
        <div className="flex relative">
          <div className="flex-shrink-0" style={{ width: 56 }}>
            {HOURS.map(h => (
              <div key={h} className="font-body text-body-sm text-rpg-muted text-right pr-2 flex items-start justify-end" style={{ height: CELL_H }}>
                <span className="mt-[-6px]">{formatHour(h)}</span>
              </div>
            ))}
          </div>
          {weekDates.map((date, dayIdx) => {
            const ds = toDateStr(date)
            const dayTodos = todosByDate.get(ds) || []
            const isToday = ds === todayStr
            return (
              <div key={dayIdx} className={`flex-1 relative ${isToday ? 'bg-rpg-gold/[0.03]' : ''}`} style={{ height: HOURS.length * CELL_H }}>
                {HOURS.map(h => (
                  <div key={h} className="absolute left-0 right-0 calendar-hour-cell" style={{ top: (h - START_HOUR) * CELL_H, height: CELL_H }}>
                    <div className="absolute left-0 right-0 border-b border-rpg-border/10" style={{ top: CELL_H / 2 }} />
                  </div>
                ))}
                {renderGCalBlocks(dayIdx)}
                {renderQuestBlocks(dayIdx)}
                {dayTodos.length > 0 && (
                  <div className="absolute left-1 right-1 top-1 z-10 space-y-0.5">
                    {dayTodos.map(todo => {
                      const color = DIFF_COLORS[todo.difficulty] || '#6b7280'
                      return (
                        <div key={todo.id} className="calendar-view-card" style={{ borderLeftColor: color }}>
                          <span className="truncate font-body text-body-sm text-rpg-text leading-tight">{todo.title}</span>
                          {todo.project_id && projects.get(todo.project_id) && (
                            <span className="font-body text-xs text-rpg-muted truncate">{projects.get(todo.project_id)!.title}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                {renderCurrentTimeLine(dayIdx)}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── Sync summary helper ───

  function renderSyncLine(block: ScheduledBlock, symbol: string, colorClass: string) {
    const todo = todos.find(t => t.id === block.todoId)
    const [, m, d] = block.date.split('-').map(Number)
    const dateObj = new Date(Number(block.date.split('-')[0]), m - 1, d)
    return (
      <div key={block.todoId} className={`font-body text-body-sm ${colorClass}`}>
        {symbol} {todo?.title} — {DAY_NAMES[dateObj.getDay()]} {d},{' '}
        {formatHour(block.startHour)}–{formatHour(block.startHour + block.durationHours)}
      </div>
    )
  }

  // ─── Main render ───

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 flex items-center justify-center" onClick={onClose}>
      <div className="calendar-modal pixel-panel flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-rpg-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <PixelButton size="xs" variant="primary" onClick={() => setWeekOffset(w => w - 1)}>◀</PixelButton>
            <span className="font-grimoire text-grimoire-base text-rpg-gold whitespace-nowrap">{weekLabel}</span>
            <PixelButton size="xs" variant="primary" onClick={() => setWeekOffset(w => w + 1)}>▶</PixelButton>
            {weekOffset !== 0 && (
              <PixelButton size="xs" variant="gold" onClick={() => setWeekOffset(0)}>Today</PixelButton>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-grimoire text-grimoire-sm text-rpg-muted">
              {mode === 'schedule' ? '⚔ Time Blocking' : '📅 Upcoming Quests'}
            </span>
            {mode === 'schedule' && hasChanges && !showSyncSummary && (
              <PixelButton size="sm" variant="gold" onClick={handleDone}>
                ⚔ SYNC ({blocksToSync.length + removedEventIds.length})
              </PixelButton>
            )}
            <PixelButton size="sm" variant="danger" onClick={onClose}>✕</PixelButton>
          </div>
        </div>

        {renderGCalConnectBar()}

        {/* Sync summary panel */}
        {showSyncSummary && (
          <div className="px-4 py-3 bg-rpg-surface border-b-2 border-rpg-border flex-shrink-0">
            <div className="font-grimoire text-grimoire-base text-rpg-gold mb-2">
              {syncDone
                ? '✦ Google Calendar updated!'
                : syncing
                ? `⏳ Syncing... (${syncProgress}/${blocksToSync.length + removedEventIds.length})`
                : '⚔ Changes Ready to Sync'}
            </div>
            <div className="space-y-1 mb-3 max-h-[140px] overflow-y-auto">
              {blocks.filter(b => !b.gcalEventId).map(b =>
                renderSyncLine(b, syncDone ? '✓' : '+', syncDone ? 'text-rpg-green' : 'text-rpg-text'),
              )}
              {blocks.filter(b => b.gcalEventId && b.dirty).map(b =>
                renderSyncLine(b, syncDone ? '✓' : '↻', syncDone ? 'text-rpg-green' : 'text-rpg-amber'),
              )}
              {removedEventIds.length > 0 && (
                <div className={`font-body text-body-sm ${syncDone ? 'text-rpg-green' : 'text-rpg-hp'}`}>
                  {syncDone ? '✓' : '✕'} {removedEventIds.length} event{removedEventIds.length > 1 ? 's' : ''} to remove
                </div>
              )}
            </div>
            {syncError && (
              <div className="font-body text-body-sm text-rpg-hp mb-2">⚠ {syncError}</div>
            )}
            <div className="flex gap-2 flex-wrap">
              {!syncDone && !syncing && (
                <PixelButton size="sm" variant="gold" onClick={syncToGoogleCalendar} disabled={!gcal.isSignedIn}>
                  {gcal.isSignedIn ? '⚔ Sync to Google Calendar' : 'Connect to Sync'}
                </PixelButton>
              )}
              {!syncing && (
                <PixelButton
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setShowSyncSummary(false)
                    setSyncDone(false)
                    setSyncProgress(0)
                    setSyncError(null)
                  }}
                >
                  {syncDone ? '✕ Close' : '← Back'}
                </PixelButton>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {mode === 'schedule' && (
            <div className="w-[200px] flex-shrink-0 border-r-2 border-rpg-border p-2 overflow-y-auto bg-rpg-bg/50 calendar-scroll">
              <div className="font-grimoire text-grimoire-sm text-rpg-gold mb-2">⚔ Available Quests</div>
              {unscheduled.length === 0 ? (
                <div className="font-body text-body-sm text-rpg-muted italic">All quests scheduled!</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {unscheduled.map(todo => (
                    <div
                      key={todo.id}
                      draggable
                      onDragStart={() => handleDragStart(todo.id)}
                      onDragEnd={handleDragEnd}
                      className="calendar-quest-chip"
                      style={{ borderLeftColor: DIFF_COLORS[todo.difficulty] || '#6b7280' }}
                    >
                      <span className="truncate font-body text-body-sm leading-tight">{todo.title}</span>
                      {todo.due_date && (
                        <span className="font-body text-xs text-rpg-muted">⏰ {todo.due_date.slice(5)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {mode === 'schedule' ? renderTimeGrid() : renderViewMode()}
        </div>
      </div>
    </div>
  )
}
