/**
 * WeeklyCalendarModal — full-screen modal for weekly quest planning and viewing.
 *
 * Supports two modes:
 * - **Schedule** ("Plan"): drag-and-drop time-blocking with a sidebar of unscheduled quests,
 *   a weekly hour grid (6 AM–10 PM), and Google Calendar events shown as read-only blocks.
 *   Users can create, move, resize, and remove quest blocks, then sync them to Google Calendar.
 * - **View**: read-only weekly calendar showing quests by due date alongside Google Calendar events.
 *
 * Scheduled blocks persist in localStorage so they survive modal close/reopen and page reloads.
 * Synced blocks track a `dirty` flag so moved/resized blocks can be re-synced without duplication.
 * Removed synced blocks queue their Google Calendar event IDs for deletion on next sync.
 */

import { useState, useMemo, useEffect, useCallback } from 'react'
import PixelButton from '../shared/PixelButton'
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar'
import type { GCalEvent } from '../../hooks/useGoogleCalendar'
import type { Todo, Project } from '../../types'

/**
 * Represents a quest that has been placed on the calendar grid.
 * Stored in localStorage so blocks persist across modal open/close cycles.
 */
interface ScheduledBlock {
  todoId: string          // ID of the Todo this block represents
  date: string            // YYYY-MM-DD — absolute date so the block is meaningful across sessions
  startHour: number       // Fractional hour (e.g. 9.5 = 9:30 AM)
  durationHours: number   // Length in hours (e.g. 1.5 = 90 minutes)
  gcalEventId?: string    // Google Calendar event ID — set after syncing
  dirty?: boolean         // True if moved/resized since last sync (needs update, not create)
}

/** Props passed from TodoList to open the modal */
interface Props {
  mode: 'schedule' | 'view'          // Which mode the modal opens in
  todos: Todo[]                       // Full list of todos (active + completed)
  projects: Map<string, Project>      // Project lookup map for displaying project names
  onClose: () => void                 // Callback to close the modal
}

// ─── LocalStorage keys ───
/** Key for persisting the array of ScheduledBlocks */
const STORAGE_KEY = 'rpg_quest_blocks'
/** Key for persisting Google Calendar event IDs queued for deletion */
const REMOVED_KEY = 'rpg_quest_blocks_removed'

// ─── Grid layout constants ───
/** Height of each hour cell in pixels */
const CELL_H = 48
/** First visible hour on the grid (6 AM) */
const START_HOUR = 6
/** Last visible hour on the grid (10 PM) */
const END_HOUR = 22
/** Array of hour values from START_HOUR to END_HOUR inclusive */
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR)
/** Short day-of-week names indexed by Date.getDay() (0=Sun, 6=Sat) */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Maps quest difficulty (1–5) to a color for block borders and backgrounds.
 * 1=green (easy) → 5=red (legendary).
 */
const DIFF_COLORS: Record<number, string> = {
  1: '#22c55e',
  2: '#3b82f6',
  3: '#eab308',
  4: '#f97316',
  5: '#ef4444',
}

// ─── Utility functions ───

/**
 * Computes the 7 dates (Sun–Sat) of the week at the given offset from today's week.
 *
 * @param offset - 0 = current week, -1 = last week, 1 = next week, etc.
 * @returns Array of 7 Date objects starting from the Sunday of the target week
 */
function getWeekDates(offset: number): Date[] {
  const now = new Date()
  // Start from today at midnight, then wind back to Sunday of this week
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  start.setDate(start.getDate() - start.getDay() + offset * 7)
  // Generate 7 consecutive days from that Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

/**
 * Formats a fractional hour into a human-readable time string.
 *
 * @example formatHour(9) => "9AM"
 * @example formatHour(13.5) => "1:30PM"
 * @param h - Fractional hour (e.g. 14.75 = 2:45 PM)
 * @returns Formatted string like "2:45PM"
 */
function formatHour(h: number): string {
  const whole = Math.floor(h)
  const mins = Math.round((h % 1) * 60)
  const suffix = whole >= 12 ? 'PM' : 'AM'
  // Convert 24h to 12h display (0→12, 13→1, etc.)
  const display = whole > 12 ? whole - 12 : whole === 0 ? 12 : whole
  return mins > 0 ? `${display}:${String(mins).padStart(2, '0')}${suffix}` : `${display}${suffix}`
}

/**
 * Converts a Date to a YYYY-MM-DD string for use as a consistent date key.
 * Uses local timezone (not UTC) so the date matches what the user sees on screen.
 *
 * @param d - Date object to convert
 * @returns Date string in YYYY-MM-DD format
 */
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Extracts the grid position (day column, start hour, duration) of a Google Calendar
 * event relative to the given week. Returns null for all-day events or events outside
 * the visible week.
 *
 * @param event     - The Google Calendar event to position
 * @param weekDates - The 7 Date objects of the currently viewed week
 * @returns Position info for rendering, or null if the event can't be placed on the grid
 */
function parseGCalEventPosition(
  event: GCalEvent,
  weekDates: Date[],
): { dayIndex: number; startHour: number; durationHours: number } | null {
  // All-day events are rendered separately in the day header, not the time grid
  if (event.allDay) return null
  const start = new Date(event.start)
  const end = new Date(event.end)
  const startDateStr = toDateStr(start)
  // Find which column (0–6) this event falls on
  const dayIndex = weekDates.findIndex(d => toDateStr(d) === startDateStr)
  if (dayIndex === -1) return null // Event is outside this week
  // Compute fractional hours for precise pixel positioning
  const startHour = start.getHours() + start.getMinutes() / 60
  const endHour = end.getHours() + end.getMinutes() / 60
  // Ensure minimum height so tiny events are still visible
  const durationHours = Math.max(0.25, endHour - startHour)
  return { dayIndex, startHour, durationHours }
}

// ─── LocalStorage persistence helpers ───

/**
 * Loads the array of scheduled blocks from localStorage.
 * Returns an empty array if nothing is stored or the data is corrupted.
 */
function loadBlocks(): ScheduledBlock[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Saves the full array of scheduled blocks to localStorage.
 * Called on every state change via a useEffect watcher.
 */
function saveBlocks(blocks: ScheduledBlock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks))
}

/**
 * Loads the array of Google Calendar event IDs that are queued for deletion.
 * These accumulate when the user removes a synced block and are cleared after sync.
 */
function loadRemovedIds(): string[] {
  try {
    const raw = localStorage.getItem(REMOVED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Saves the pending-deletion event IDs to localStorage.
 * Removes the key entirely when the list is empty to keep storage clean.
 */
function saveRemovedIds(ids: string[]) {
  if (ids.length === 0) {
    localStorage.removeItem(REMOVED_KEY)
  } else {
    localStorage.setItem(REMOVED_KEY, JSON.stringify(ids))
  }
}

// ─── Component ───

/**
 * Full-screen weekly calendar modal.
 * In "schedule" mode, renders a drag-and-drop time grid with a quest sidebar.
 * In "view" mode, renders a read-only calendar showing quests and Google Calendar events.
 */
export default function WeeklyCalendarModal({ mode, todos, projects, onClose }: Props) {
  // Week navigation: 0 = current week, -1 = last week, +1 = next week
  const [weekOffset, setWeekOffset] = useState(0)
  // All scheduled blocks (across all weeks) — persisted to localStorage
  const [blocks, setBlocks] = useState<ScheduledBlock[]>(loadBlocks)
  // ID of the quest currently being dragged (null when idle)
  const [dragId, setDragId] = useState<string | null>(null)
  // Key of the hour cell currently hovered during a drag ("dayIdx-hour")
  const [hoverCell, setHoverCell] = useState<string | null>(null)
  // Whether the sync summary panel is visible
  const [showSyncSummary, setShowSyncSummary] = useState(false)
  // Whether the most recent sync completed successfully
  const [syncDone, setSyncDone] = useState(false)
  // Whether a sync is currently in progress
  const [syncing, setSyncing] = useState(false)
  // Number of sync operations completed (drives the progress counter)
  const [syncProgress, setSyncProgress] = useState(0)
  // Error message from the last failed sync attempt
  const [syncError, setSyncError] = useState<string | null>(null)
  // Google Calendar event IDs queued for deletion on next sync
  const [removedEventIds, setRemovedEventIds] = useState<string[]>(loadRemovedIds)

  // Google Calendar hook — provides auth state, events, and CRUD methods
  const gcal = useGoogleCalendar()

  // Compute the 7 dates of the currently viewed week
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])
  // YYYY-MM-DD strings for each day of the week (used for block filtering)
  const weekDateStrs = useMemo(() => weekDates.map(toDateStr), [weekDates])
  // Today's date string for highlighting the current day column
  const todayStr = toDateStr(new Date())
  // Current time info for the "now" indicator line
  const now = new Date()
  const currentHourFrac = now.getHours() + now.getMinutes() / 60
  const currentDayIdx = now.getDay()
  const isCurrentWeek = weekOffset === 0

  // Persist blocks and removed IDs to localStorage whenever they change
  useEffect(() => { saveBlocks(blocks) }, [blocks])
  useEffect(() => { saveRemovedIds(removedEventIds) }, [removedEventIds])

  /**
   * Fetch Google Calendar events whenever the viewed week changes or sign-in state changes.
   * Requests events from the start of the week through the end of the last day (exclusive).
   */
  useEffect(() => {
    if (!gcal.isSignedIn) return
    const timeMin = weekDates[0].toISOString()
    // End of the week = start of the day after Saturday
    const endDate = new Date(weekDates[6])
    endDate.setDate(endDate.getDate() + 1)
    gcal.fetchEvents(timeMin, endDate.toISOString())
  }, [weekOffset, gcal.isSignedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Set of Google Calendar event IDs that are "managed" by our quest blocks.
   * These are filtered out of the gcal display layer to prevent duplicate rendering —
   * the quest block layer already shows them with edit controls.
   */
  const managedGCalIds = useMemo(() => {
    const ids = new Set<string>()
    for (const b of blocks) {
      if (b.gcalEventId) ids.add(b.gcalEventId)
    }
    return ids
  }, [blocks])

  /**
   * Google Calendar events positioned on this week's grid, excluding managed ones.
   * Each entry includes the original event plus its computed grid position.
   */
  const gcalBlocks = useMemo(() => {
    const result: { event: GCalEvent; dayIndex: number; startHour: number; durationHours: number }[] = []
    for (const ev of gcal.events) {
      if (managedGCalIds.has(ev.id)) continue // Skip events we manage as quest blocks
      const pos = parseGCalEventPosition(ev, weekDates)
      if (pos) result.push({ event: ev, ...pos })
    }
    return result
  }, [gcal.events, weekDates, managedGCalIds])

  /**
   * All-day Google Calendar events grouped by date string.
   * Rendered as pills in the day column headers rather than on the time grid.
   */
  const allDayEvents = useMemo(() => {
    const m = new Map<string, GCalEvent[]>()
    for (const ev of gcal.events) {
      if (!ev.allDay) continue
      const ds = ev.start.slice(0, 10) // Extract YYYY-MM-DD from the start date
      const arr = m.get(ds) || []
      arr.push(ev)
      m.set(ds, arr)
    }
    return m
  }, [gcal.events])

  /** Blocks that fall within the currently viewed week (used for rendering) */
  const weekBlocks = useMemo(
    () => blocks.filter(b => weekDateStrs.includes(b.date)),
    [blocks, weekDateStrs],
  )

  /** Active (incomplete) todos — candidates for scheduling */
  const activeTodos = useMemo(() => todos.filter(t => !t.completed), [todos])
  /** Set of todo IDs that already have a scheduled block (across all weeks) */
  const scheduledIds = new Set(blocks.map(b => b.todoId))
  /** Active todos that have not yet been placed on the calendar */
  const unscheduled = activeTodos.filter(t => !scheduledIds.has(t.id))

  /**
   * For view mode: groups active todos by their due_date string.
   * Only includes todos that have a due date set.
   */
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

  /** Human-readable label for the current week (e.g. "Apr 6 — Apr 12, 2026") */
  const weekLabel = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  // ─── Drag & drop handlers ───

  /**
   * Begins a drag operation by recording which quest is being dragged.
   * Works for both sidebar chips (new placement) and existing blocks (repositioning).
   *
   * @param todoId - The ID of the todo being dragged
   */
  function handleDragStart(todoId: string) {
    setDragId(todoId)
  }

  /** Clears drag state when the drag operation ends (drop or cancel). */
  function handleDragEnd() {
    setDragId(null)
    setHoverCell(null)
  }

  /**
   * Handles dropping a quest onto a specific hour cell.
   * If the quest already has a block, it moves the block to the new position
   * and marks it dirty if it was previously synced. If it's a new placement,
   * creates a block with a default 1-hour duration.
   *
   * @param dayIndex - Column index (0=Sun, 6=Sat)
   * @param hour     - The hour row where the quest was dropped
   */
  function handleDrop(dayIndex: number, hour: number) {
    if (!dragId) return
    const dateStr = weekDateStrs[dayIndex]
    setBlocks(prev => {
      // Check if this quest already has a block (move operation)
      const existing = prev.find(b => b.todoId === dragId)
      return [
        ...prev.filter(b => b.todoId !== dragId), // Remove old position if exists
        {
          todoId: dragId,
          date: dateStr,
          startHour: hour,
          durationHours: existing?.durationHours ?? 1, // Preserve duration or default to 1h
          gcalEventId: existing?.gcalEventId,           // Preserve sync link
          dirty: !!existing?.gcalEventId,               // Mark dirty if already synced
        },
      ]
    })
    setDragId(null)
    setHoverCell(null)
  }

  /**
   * Removes a quest block from the calendar.
   * If the block was synced to Google Calendar, queues its event ID for deletion on next sync.
   *
   * @param todoId - The ID of the quest block to remove
   */
  function removeBlock(todoId: string) {
    const block = blocks.find(b => b.todoId === todoId)
    // If this block was synced, queue its gcal event for deletion
    if (block?.gcalEventId) {
      setRemovedEventIds(prev => [...prev, block.gcalEventId!])
    }
    setBlocks(prev => prev.filter(b => b.todoId !== todoId))
  }

  /**
   * Adjusts a block's duration by the given delta (in hours).
   * Clamps between 0.5h (minimum) and 4h (maximum).
   * Marks the block dirty if it was previously synced.
   *
   * @param todoId - The quest block to resize
   * @param delta  - Hours to add (positive) or subtract (negative), typically ±0.5
   */
  function adjustDuration(todoId: string, delta: number) {
    setBlocks(prev =>
      prev.map(b =>
        b.todoId === todoId
          ? {
              ...b,
              durationHours: Math.max(0.5, Math.min(4, b.durationHours + delta)),
              dirty: !!b.gcalEventId, // Mark dirty if already synced
            }
          : b,
      ),
    )
  }

  // ─── Sync logic ───

  /** Blocks that need to be created or updated in Google Calendar */
  const blocksToSync = blocks.filter(b => !b.gcalEventId || b.dirty)
  /** Whether there are any pending changes (creates, updates, or deletes) */
  const hasChanges = blocksToSync.length > 0 || removedEventIds.length > 0

  /** Opens the sync summary panel so the user can review and confirm changes. */
  function handleDone() {
    setShowSyncSummary(true)
  }

  /**
   * Converts a ScheduledBlock's date + startHour + durationHours into ISO datetime strings.
   * Used when creating or updating Google Calendar events.
   *
   * @param block - The scheduled block to convert
   * @returns Object with startISO and endISO datetime strings
   */
  const blockToDateTimes = useCallback((block: ScheduledBlock) => {
    // Parse the YYYY-MM-DD date parts
    const [y, m, d] = block.date.split('-').map(Number)
    // Build start datetime from the date + fractional hour
    const startDt = new Date(y, m - 1, d)
    startDt.setHours(Math.floor(block.startHour), Math.round((block.startHour % 1) * 60), 0, 0)
    // Build end datetime by adding the duration
    const endDt = new Date(startDt)
    endDt.setMinutes(endDt.getMinutes() + Math.round(block.durationHours * 60))
    return { startISO: startDt.toISOString(), endISO: endDt.toISOString() }
  }, [])

  /**
   * Executes the full sync lifecycle: deletes removed events, then creates/updates blocks.
   *
   * 1. Deletes Google Calendar events for removed synced blocks
   * 2. Creates new events for unsynced blocks
   * 3. Updates existing events for dirty (moved/resized) blocks
   * 4. Clears dirty flags and stores new event IDs
   * 5. Refreshes Google Calendar events to reflect changes
   *
   * On 401/403 errors, auto-disconnects and prompts the user to reconnect.
   */
  async function syncToGoogleCalendar() {
    // If not signed in, trigger OAuth flow instead of syncing
    if (!gcal.isSignedIn) {
      gcal.signIn()
      return
    }
    setSyncing(true)
    setSyncProgress(0)
    setSyncError(null)

    let completed = 0

    try {
      // Phase 1: Delete removed synced blocks from Google Calendar
      for (const eventId of removedEventIds) {
        await gcal.deleteEvent(eventId)
        completed++
        setSyncProgress(completed)
      }

      // Phase 2: Create or update blocks
      const updatedBlocks = [...blocks]
      for (let i = 0; i < updatedBlocks.length; i++) {
        const block = updatedBlocks[i]
        // Skip blocks that are already synced and haven't been modified
        if (block.gcalEventId && !block.dirty) continue

        // Find the corresponding todo for title and description
        const todo = todos.find(t => t.id === block.todoId)
        if (!todo) continue

        const { startISO, endISO } = blockToDateTimes(block)

        if (block.gcalEventId && block.dirty) {
          // Block was synced before but moved/resized — update the existing event
          await gcal.updateEvent(
            block.gcalEventId,
            todo.title,
            startISO,
            endISO,
            todo.description || undefined,
          )
          updatedBlocks[i] = { ...block, dirty: false }
        } else {
          // New block — create a new Google Calendar event
          const eventId = await gcal.createEvent(
            todo.title,
            startISO,
            endISO,
            todo.description || undefined,
          )
          // Store the event ID so future edits can update instead of re-create
          updatedBlocks[i] = { ...block, gcalEventId: eventId, dirty: false }
        }
        completed++
        setSyncProgress(completed)
      }

      // Commit all changes to state and clear the deletion queue
      setBlocks(updatedBlocks)
      setRemovedEventIds([])
      setSyncDone(true)

      // Refresh Google Calendar events to show the newly synced blocks
      const timeMin = weekDates[0].toISOString()
      const endDate = new Date(weekDates[6])
      endDate.setDate(endDate.getDate() + 1)
      gcal.fetchEvents(timeMin, endDate.toISOString())
    } catch (err: any) {
      // Extract the most informative error message available
      const msg = err?.result?.error?.message || err?.message || 'Failed to sync events'
      setSyncError(msg)
      // Handle auth errors by disconnecting — the token is no longer valid
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

  /**
   * Renders the Google Calendar connection status bar below the header.
   * Shows connect/disconnect buttons, loading state, refresh button, and errors.
   */
  function renderGCalConnectBar() {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border-b border-rpg-border/50 flex-shrink-0 bg-rpg-bg/80">
        {gcal.isSignedIn ? (
          <>
            {/* Green dot + status text */}
            <span className="font-body text-body-sm text-rpg-green">● Connected to Google Calendar</span>
            {/* Blinking "Fetching..." indicator while loading events */}
            {gcal.loading && <span className="font-body text-body-sm text-rpg-muted animate-blink">Fetching...</span>}
            {/* Manual refresh button — re-fetches events for the current week */}
            <PixelButton size="xs" variant="primary" onClick={() => {
              const timeMin = weekDates[0].toISOString()
              const endDate = new Date(weekDates[6])
              endDate.setDate(endDate.getDate() + 1)
              gcal.fetchEvents(timeMin, endDate.toISOString())
            }}>
              ↻ Refresh
            </PixelButton>
            {/* Disconnect button — revokes the OAuth token */}
            <PixelButton size="xs" variant="danger" onClick={gcal.signOut}>
              Disconnect
            </PixelButton>
          </>
        ) : (
          <>
            {/* Disconnected state — prompt user to connect */}
            <span className="font-body text-body-sm text-rpg-muted">○ Google Calendar not connected</span>
            <PixelButton size="xs" variant="gold" onClick={gcal.signIn}>
              Connect Google Calendar
            </PixelButton>
          </>
        )}
        {/* Error message from the last failed gcal operation */}
        {gcal.error && <span className="font-body text-body-sm text-rpg-hp">{gcal.error}</span>}
      </div>
    )
  }

  /**
   * Renders a single day column header with the day name, date number,
   * and any all-day Google Calendar events as compact pills.
   *
   * @param date - The Date object for this column
   * @param idx  - Column index (used as React key)
   */
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
          {/* Highlight today's date number with bold */}
          <div className={`text-lg ${isToday ? 'font-bold' : ''}`}>{date.getDate()}</div>
        </div>
        {/* All-day event pills stacked below the date */}
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

  /**
   * Renders Google Calendar event blocks for a given day column.
   * These are read-only mana-blue blocks. Events managed by quest blocks
   * are excluded via the managedGCalIds filter in the gcalBlocks memo.
   *
   * @param dayIdx - Column index (0–6) to render blocks for
   */
  function renderGCalBlocks(dayIdx: number) {
    return gcalBlocks
      .filter(b => b.dayIndex === dayIdx)
      .map(({ event, startHour, durationHours }) => {
        // Clamp to visible grid range so blocks don't overflow
        const clampedStart = Math.max(startHour, START_HOUR)
        const clampedEnd = Math.min(startHour + durationHours, END_HOUR + 1)
        if (clampedStart >= clampedEnd) return null // Fully outside visible range
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
            {/* Event title, truncated if the block is too narrow */}
            <span className="truncate font-body text-body-sm leading-tight">{event.summary}</span>
            {/* Time range subtitle */}
            <span className="font-body text-xs opacity-70">
              {formatHour(startHour)}–{formatHour(startHour + durationHours)}
            </span>
          </div>
        )
      })
  }

  /**
   * Renders scheduled quest blocks for a given day column.
   * Each block is draggable (for repositioning), shows sync status indicators,
   * and reveals resize/remove controls on hover.
   *
   * @param dayIdx - Column index (0–6) to render blocks for
   */
  function renderQuestBlocks(dayIdx: number) {
    const dateStr = weekDateStrs[dayIdx]
    return weekBlocks
      .filter(b => b.date === dateStr)
      .map(block => {
        const todo = todos.find(t => t.id === block.todoId)
        if (!todo) return null
        // Color based on quest difficulty
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
              backgroundColor: color + '25',  // 25 = ~15% opacity hex suffix
              borderLeftColor: color,
            }}
          >
            <div className="flex items-center gap-1">
              {/* Sync status indicators */}
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
            {/* Hover controls: shrink (−), extend (+), remove (✕) */}
            <div className="calendar-block-controls">
              <button onClick={e => { e.stopPropagation(); adjustDuration(block.todoId, -0.5) }} title="Shrink">−</button>
              <button onClick={e => { e.stopPropagation(); adjustDuration(block.todoId, 0.5) }} title="Extend">+</button>
              <button onClick={e => { e.stopPropagation(); removeBlock(block.todoId) }} title="Remove">✕</button>
            </div>
          </div>
        )
      })
  }

  /**
   * Renders a horizontal red line indicating the current time on today's column.
   * Only appears when viewing the current week and the current time is within the grid range.
   *
   * @param dayIdx - Column index to check against the current day
   * @returns The time indicator element, or null if this column isn't today
   */
  function renderCurrentTimeLine(dayIdx: number) {
    if (!isCurrentWeek || dayIdx !== currentDayIdx) return null
    if (currentHourFrac < START_HOUR || currentHourFrac > END_HOUR) return null
    return (
      <div
        className="absolute left-0 right-0 z-20 pointer-events-none"
        style={{ top: (currentHourFrac - START_HOUR) * CELL_H }}
      >
        {/* Red horizontal line with a circular dot on the left edge */}
        <div className="border-t-2 border-rpg-hp relative">
          <div className="absolute -top-[5px] -left-[5px] w-[10px] h-[10px] rounded-full bg-rpg-hp" />
        </div>
      </div>
    )
  }

  /**
   * Renders the full time grid for schedule mode.
   * Layout: sticky day headers on top, hour labels on the left,
   * 7 day columns each containing drop targets, gcal blocks, quest blocks,
   * and the current time indicator.
   */
  function renderTimeGrid() {
    return (
      <div className="flex-1 overflow-auto calendar-scroll">
        {/* Sticky header row with day names and dates */}
        <div className="flex sticky top-0 z-10 bg-rpg-bg">
          {/* Spacer matching the width of the hour label column */}
          <div className="flex-shrink-0" style={{ width: 56 }} />
          {weekDates.map((date, i) => renderDayHeader(date, i))}
        </div>
        <div className="flex relative">
          {/* Hour label column on the left side */}
          <div className="flex-shrink-0" style={{ width: 56 }}>
            {HOURS.map(h => (
              <div key={h} className="font-body text-body-sm text-rpg-muted text-right pr-2 flex items-start justify-end" style={{ height: CELL_H }}>
                {/* Offset label slightly upward to align with the grid line */}
                <span className="mt-[-6px]">{formatHour(h)}</span>
              </div>
            ))}
          </div>
          {/* 7 day columns */}
          {weekDates.map((date, dayIdx) => {
            const isToday = toDateStr(date) === todayStr
            return (
              <div key={dayIdx} className={`flex-1 relative ${isToday ? 'bg-rpg-gold/[0.03]' : ''}`} style={{ height: HOURS.length * CELL_H }}>
                {/* Drop target cells — one per hour, handles dragOver/drop events */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className={`absolute left-0 right-0 calendar-hour-cell ${hoverCell === `${dayIdx}-${h}` ? 'calendar-cell-hover' : ''}`}
                    style={{ top: (h - START_HOUR) * CELL_H, height: CELL_H }}
                    onDragOver={e => { e.preventDefault(); setHoverCell(`${dayIdx}-${h}`) }}
                    onDragLeave={() => setHoverCell(null)}
                    onDrop={e => { e.preventDefault(); handleDrop(dayIdx, h) }}
                  >
                    {/* Half-hour divider line within each cell */}
                    <div className="absolute left-0 right-0 border-b border-rpg-border/10" style={{ top: CELL_H / 2 }} />
                  </div>
                ))}
                {/* Layered content: gcal blocks → quest blocks → time indicator */}
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

  /**
   * Renders the read-only view mode calendar.
   * Similar to the time grid but without drop targets. Shows quest cards by due date
   * pinned to the top of each day column, plus gcal events and scheduled blocks.
   */
  function renderViewMode() {
    return (
      <div className="flex-1 overflow-auto calendar-scroll">
        {/* Sticky header row (no hour label spacer in view mode) */}
        <div className="flex sticky top-0 z-10 bg-rpg-bg">
          {weekDates.map((date, i) => renderDayHeader(date, i))}
        </div>
        <div className="flex relative">
          {/* Hour label column */}
          <div className="flex-shrink-0" style={{ width: 56 }}>
            {HOURS.map(h => (
              <div key={h} className="font-body text-body-sm text-rpg-muted text-right pr-2 flex items-start justify-end" style={{ height: CELL_H }}>
                <span className="mt-[-6px]">{formatHour(h)}</span>
              </div>
            ))}
          </div>
          {/* 7 day columns with quests, gcal events, and time indicator */}
          {weekDates.map((date, dayIdx) => {
            const ds = toDateStr(date)
            const dayTodos = todosByDate.get(ds) || [] // Todos due on this date
            const isToday = ds === todayStr
            return (
              <div key={dayIdx} className={`flex-1 relative ${isToday ? 'bg-rpg-gold/[0.03]' : ''}`} style={{ height: HOURS.length * CELL_H }}>
                {/* Hour grid lines (read-only, no drag handlers) */}
                {HOURS.map(h => (
                  <div key={h} className="absolute left-0 right-0 calendar-hour-cell" style={{ top: (h - START_HOUR) * CELL_H, height: CELL_H }}>
                    <div className="absolute left-0 right-0 border-b border-rpg-border/10" style={{ top: CELL_H / 2 }} />
                  </div>
                ))}
                {renderGCalBlocks(dayIdx)}
                {renderQuestBlocks(dayIdx)}
                {/* Quest cards pinned to top of the day column (by due date) */}
                {dayTodos.length > 0 && (
                  <div className="absolute left-1 right-1 top-1 z-10 space-y-0.5">
                    {dayTodos.map(todo => {
                      const color = DIFF_COLORS[todo.difficulty] || '#6b7280'
                      return (
                        <div key={todo.id} className="calendar-view-card" style={{ borderLeftColor: color }}>
                          <span className="truncate font-body text-body-sm text-rpg-text leading-tight">{todo.title}</span>
                          {/* Show project name if the quest belongs to a project */}
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

  /**
   * Renders a single line item in the sync summary panel showing what will be
   * (or was) synced for a given block.
   *
   * @param block      - The scheduled block to display
   * @param symbol     - Prefix symbol ('+' for create, '↻' for update, '✓' after sync)
   * @param colorClass - Tailwind text color class for the line
   */
  function renderSyncLine(block: ScheduledBlock, symbol: string, colorClass: string) {
    const todo = todos.find(t => t.id === block.todoId)
    // Parse date parts from the YYYY-MM-DD string to display day name and date
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
    // Full-screen overlay — clicking the backdrop closes the modal
    <div className="fixed inset-0 z-[9999] bg-black/75 flex items-center justify-center" onClick={onClose}>
      {/* Modal container — stopPropagation prevents backdrop click from closing */}
      <div className="calendar-modal pixel-panel flex flex-col" onClick={e => e.stopPropagation()}>
        {/* ── Header bar with week navigation, mode label, sync button, and close ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-rpg-border flex-shrink-0">
          {/* Left side: week navigation arrows and label */}
          <div className="flex items-center gap-2">
            <PixelButton size="xs" variant="primary" onClick={() => setWeekOffset(w => w - 1)}>◀</PixelButton>
            <span className="font-grimoire text-grimoire-base text-rpg-gold whitespace-nowrap">{weekLabel}</span>
            <PixelButton size="xs" variant="primary" onClick={() => setWeekOffset(w => w + 1)}>▶</PixelButton>
            {/* "Today" button only shown when not viewing the current week */}
            {weekOffset !== 0 && (
              <PixelButton size="xs" variant="gold" onClick={() => setWeekOffset(0)}>Today</PixelButton>
            )}
          </div>
          {/* Right side: mode label, sync button (when changes exist), close button */}
          <div className="flex items-center gap-2">
            <span className="font-grimoire text-grimoire-sm text-rpg-muted">
              {mode === 'schedule' ? '⚔ Time Blocking' : '📅 Upcoming Quests'}
            </span>
            {/* Sync button — only visible in schedule mode when there are pending changes */}
            {mode === 'schedule' && hasChanges && !showSyncSummary && (
              <PixelButton size="sm" variant="gold" onClick={handleDone}>
                ⚔ SYNC ({blocksToSync.length + removedEventIds.length})
              </PixelButton>
            )}
            <PixelButton size="sm" variant="danger" onClick={onClose}>✕</PixelButton>
          </div>
        </div>

        {/* Google Calendar connection status bar */}
        {renderGCalConnectBar()}

        {/* ── Sync summary panel — shown when user clicks SYNC ── */}
        {showSyncSummary && (
          <div className="px-4 py-3 bg-rpg-surface border-b-2 border-rpg-border flex-shrink-0">
            {/* Dynamic title: changes based on sync state */}
            <div className="font-grimoire text-grimoire-base text-rpg-gold mb-2">
              {syncDone
                ? '✦ Google Calendar updated!'
                : syncing
                ? `⏳ Syncing... (${syncProgress}/${blocksToSync.length + removedEventIds.length})`
                : '⚔ Changes Ready to Sync'}
            </div>
            {/* List of individual changes with appropriate symbols and colors */}
            <div className="space-y-1 mb-3 max-h-[140px] overflow-y-auto">
              {/* New blocks (not yet synced) */}
              {blocks.filter(b => !b.gcalEventId).map(b =>
                renderSyncLine(b, syncDone ? '✓' : '+', syncDone ? 'text-rpg-green' : 'text-rpg-text'),
              )}
              {/* Dirty blocks (synced but modified) */}
              {blocks.filter(b => b.gcalEventId && b.dirty).map(b =>
                renderSyncLine(b, syncDone ? '✓' : '↻', syncDone ? 'text-rpg-green' : 'text-rpg-amber'),
              )}
              {/* Pending deletions count */}
              {removedEventIds.length > 0 && (
                <div className={`font-body text-body-sm ${syncDone ? 'text-rpg-green' : 'text-rpg-hp'}`}>
                  {syncDone ? '✓' : '✕'} {removedEventIds.length} event{removedEventIds.length > 1 ? 's' : ''} to remove
                </div>
              )}
            </div>
            {/* Sync error message */}
            {syncError && (
              <div className="font-body text-body-sm text-rpg-hp mb-2">⚠ {syncError}</div>
            )}
            {/* Action buttons: Sync and Back/Close */}
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
                    // Reset sync panel state so it's fresh on next open
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

        {/* ── Body: sidebar (schedule mode only) + calendar grid ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Sidebar with unscheduled quests — only shown in schedule/plan mode */}
          {mode === 'schedule' && (
            <div className="w-[200px] flex-shrink-0 border-r-2 border-rpg-border p-2 overflow-y-auto bg-rpg-bg/50 calendar-scroll">
              <div className="font-grimoire text-grimoire-sm text-rpg-gold mb-2">⚔ Available Quests</div>
              {unscheduled.length === 0 ? (
                <div className="font-body text-body-sm text-rpg-muted italic">All quests scheduled!</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {/* Each chip is draggable onto the time grid */}
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
                      {/* Show due date if set, with clock emoji */}
                      {todo.due_date && (
                        <span className="font-body text-xs text-rpg-muted">⏰ {todo.due_date.slice(5)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Render the appropriate grid based on mode */}
          {mode === 'schedule' ? renderTimeGrid() : renderViewMode()}
        </div>
      </div>
    </div>
  )
}
