/**
 * useGoogleCalendar — React hook for Google Calendar API integration.
 *
 * Handles OAuth2 authentication via Google Identity Services (GIS),
 * initializes the gapi client, and provides methods to fetch, create,
 * update, and delete calendar events on the user's primary calendar.
 *
 * Auth tokens are persisted in localStorage so the user stays signed in
 * across page reloads until the token expires or the scope changes.
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// OAuth2 client ID from Google Cloud Console — identifies this app
const CLIENT_ID = '1000515780562-69b88otiani2shoq45qeue1mdj5unick.apps.googleusercontent.com'

// Scope grants read + write access to calendar events (not full calendar admin)
const SCOPES = 'https://www.googleapis.com/auth/calendar.events'

// Discovery doc tells gapi how to construct Calendar API requests
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'

/**
 * Simplified representation of a Google Calendar event.
 * Flattened from the raw gapi response for easier consumption by UI components.
 */
export interface GCalEvent {
  id: string
  summary: string
  start: string      // ISO datetime string for timed events, YYYY-MM-DD for all-day
  end: string        // ISO datetime string for timed events, YYYY-MM-DD for all-day
  allDay: boolean    // true if this is an all-day event (no specific start/end time)
  location?: string
  description?: string
  colorId?: string   // Google Calendar color ID ('1'-'11')
}

// Extend the Window interface so TypeScript recognizes the gapi and google globals
// injected by the <script> tags in index.html
declare global {
  interface Window {
    gapi: any
    google: any
  }
}

/**
 * Polls for a global variable to become available on `window`.
 * The GIS and gapi scripts are loaded with `async defer`, so they
 * may not be ready when our React code first runs.
 *
 * @param key - The window property to wait for ('gapi' or 'google')
 * @param timeout - Maximum milliseconds to wait before rejecting
 * @returns Promise that resolves once window[key] is truthy
 */
function waitForGlobal(key: 'gapi' | 'google', timeout = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already available — resolve immediately
    if (window[key]) return resolve()
    const start = Date.now()
    // Poll every 100ms until the global appears or we time out
    const check = setInterval(() => {
      if (window[key]) { clearInterval(check); resolve() }
      else if (Date.now() - start > timeout) { clearInterval(check); reject(new Error(`${key} script failed to load`)) }
    }, 100)
  })
}

/**
 * React hook that manages the full Google Calendar lifecycle:
 * - Initializes gapi client and GIS token client on mount
 * - Restores saved auth tokens from localStorage
 * - Exposes signIn / signOut for user-triggered auth
 * - Provides fetchEvents, createEvent, updateEvent, deleteEvent for CRUD
 *
 * @returns Object with auth state, event data, loading/error states, and CRUD methods
 */
export function useGoogleCalendar() {
  // Whether the user currently has a valid access token
  const [isSignedIn, setIsSignedIn] = useState(false)
  // Array of calendar events fetched for the current date range
  const [events, setEvents] = useState<GCalEvent[]>([])
  // True while a fetchEvents call is in flight
  const [loading, setLoading] = useState(false)
  // Human-readable error message from the last failed operation
  const [error, setError] = useState<string | null>(null)
  // Tracks whether gapi.client.init has completed (runs once)
  const gapiInited = useRef(false)
  // Holds the GIS TokenClient instance after initialization
  const tokenClientRef = useRef<any>(null)
  // Allows async callers to wait for the GIS auth callback to fire
  const fetchResolveRef = useRef<(() => void) | null>(null)

  /**
   * Initializes the Google API client library (gapi).
   * Loads the 'client' module, configures it with the Calendar discovery doc,
   * and attempts to restore a previously saved access token from localStorage.
   * Only runs once — subsequent calls are no-ops due to the gapiInited guard.
   */
  const initGapi = useCallback(async () => {
    if (gapiInited.current) return
    // Wait for the gapi script tag to finish loading
    await waitForGlobal('gapi')
    // Load the gapi client module
    await new Promise<void>((resolve) => window.gapi.load('client', resolve))
    // Initialize with Calendar API discovery doc so we get typed methods
    await window.gapi.client.init({
      discoveryDocs: [DISCOVERY_DOC],
    })
    gapiInited.current = true

    // Attempt to restore a previously saved token from localStorage
    const stored = localStorage.getItem('gcal_token')
    if (stored) {
      try {
        const token = JSON.parse(stored)
        // Validate: token must not be expired (with 60s buffer) and must match current scope.
        // The scope check catches cases where we upgraded from readonly to read-write —
        // the old token wouldn't have write permission.
        if (
          token.expires_at && token.expires_at > Date.now() + 60_000
          && token.scope === SCOPES
        ) {
          // Restore the token into gapi so API calls work immediately
          window.gapi.client.setToken({ access_token: token.access_token })
          setIsSignedIn(true)
        } else {
          // Token is expired or has wrong scope — discard it
          localStorage.removeItem('gcal_token')
        }
      } catch {
        // Corrupted JSON — discard
        localStorage.removeItem('gcal_token')
      }
    }
  }, [])

  /**
   * Initializes the Google Identity Services (GIS) token client.
   * This client handles the OAuth2 consent popup when the user clicks "Connect".
   * The callback fires after the user grants access, providing an access token
   * which we store in localStorage for persistence.
   */
  const initTokenClient = useCallback(async () => {
    if (tokenClientRef.current) return
    // Wait for the GIS script tag to finish loading
    await waitForGlobal('google')
    // Create the token client — this does NOT trigger a popup, just configures one
    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      // This callback fires after the user completes the OAuth consent flow
      callback: (response: any) => {
        if (response.error) {
          setError(response.error)
          return
        }
        // Persist the token with its expiry time and the scope it was granted for
        const tokenData = {
          access_token: response.access_token,
          expires_at: Date.now() + response.expires_in * 1000,
          scope: SCOPES,
        }
        localStorage.setItem('gcal_token', JSON.stringify(tokenData))
        setIsSignedIn(true)
        setError(null)
        // If a fetchEvents or createEvent call was waiting for auth, unblock it
        if (fetchResolveRef.current) {
          fetchResolveRef.current()
          fetchResolveRef.current = null
        }
      },
    })
  }, [])

  // Run initialization on mount — both gapi and GIS are set up in parallel
  useEffect(() => {
    initGapi().catch((err) => setError(err.message))
    initTokenClient().catch((err) => setError(err.message))
  }, [initGapi, initTokenClient])

  /**
   * Opens the Google OAuth consent popup so the user can grant calendar access.
   * Uses prompt: 'consent' to always show the full consent screen (needed when
   * upgrading scopes or when the user previously revoked access).
   */
  const signIn = useCallback(() => {
    if (!tokenClientRef.current) return
    tokenClientRef.current.requestAccessToken({ prompt: 'consent' })
  }, [])

  /**
   * Signs the user out by revoking the access token, clearing it from gapi,
   * removing it from localStorage, and resetting all state.
   */
  const signOut = useCallback(() => {
    const token = window.gapi?.client?.getToken?.()
    if (token) {
      // Revoke the token server-side so it can't be reused
      window.google?.accounts?.oauth2?.revoke?.(token.access_token)
      // Clear it from the gapi client
      window.gapi.client.setToken(null)
    }
    localStorage.removeItem('gcal_token')
    setIsSignedIn(false)
    setEvents([])
  }, [])

  /**
   * Ensures we have a valid gapi token, prompting sign-in if needed.
   * Used internally before every API call so callers don't need to check auth.
   */
  const ensureToken = useCallback(async () => {
    if (!gapiInited.current) await initGapi()
    // If there's no token set on gapi, trigger the OAuth flow and wait for the callback
    if (!window.gapi.client.getToken()) {
      if (!tokenClientRef.current) await initTokenClient()
      await new Promise<void>((resolve) => {
        fetchResolveRef.current = resolve
        // prompt: '' reuses existing consent if available, avoiding an extra popup
        tokenClientRef.current.requestAccessToken({ prompt: '' })
      })
    }
  }, [initGapi, initTokenClient])

  /**
   * Fetches calendar events from the user's primary Google Calendar
   * for the given time range. Results are stored in the `events` state.
   *
   * If the user is not signed in, this will trigger the OAuth consent flow
   * automatically and fetch events after auth completes.
   *
   * @param timeMin - Start of the date range (ISO string or Date-parseable string)
   * @param timeMax - End of the date range (ISO string or Date-parseable string)
   */
  const fetchEvents = useCallback(
    async (timeMin: string, timeMax: string) => {
      setLoading(true)
      setError(null)

      try {
        await ensureToken()

        // Call the Calendar API — singleEvents: true expands recurring events
        const response = await window.gapi.client.calendar.events.list({
          calendarId: 'primary',
          timeMin: new Date(timeMin).toISOString(),
          timeMax: new Date(timeMax).toISOString(),
          singleEvents: true,        // Expand recurring events into individual instances
          orderBy: 'startTime',      // Return events in chronological order
          maxResults: 250,           // Max allowed by the API per page
        })

        // Map the raw gapi response items to our simplified GCalEvent interface
        const items: GCalEvent[] = (response.result.items || []).map((item: any) => ({
          id: item.id,
          summary: item.summary || '(No title)',
          start: item.start.dateTime || item.start.date,    // dateTime for timed, date for all-day
          end: item.end.dateTime || item.end.date,
          allDay: !item.start.dateTime,                     // All-day events only have .date
          location: item.location,
          description: item.description,
          colorId: item.colorId,
        }))

        setEvents(items)
      } catch (err: any) {
        // 401 means the token expired — clear it and prompt re-auth
        if (err?.status === 401) {
          localStorage.removeItem('gcal_token')
          window.gapi.client.setToken(null)
          setIsSignedIn(false)
          setError('Session expired. Please sign in again.')
        } else {
          setError(err?.message || 'Failed to fetch calendar events')
        }
      } finally {
        setLoading(false)
      }
    },
    [ensureToken],
  )

  /**
   * Creates a new event on the user's primary Google Calendar.
   *
   * @param summary - Event title
   * @param startDateTime - Event start time as ISO 8601 string
   * @param endDateTime - Event end time as ISO 8601 string
   * @param description - Optional event description/notes
   * @returns The Google Calendar event ID of the newly created event
   */
  const createEvent = useCallback(
    async (summary: string, startDateTime: string, endDateTime: string, description?: string) => {
      await ensureToken()

      // Insert a new event via the Calendar API
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary,
          description: description || undefined,
          start: { dateTime: startDateTime },
          end: { dateTime: endDateTime },
        },
      })

      // Return the event ID so the caller can track this event for future updates
      return response.result.id as string
    },
    [ensureToken],
  )

  /**
   * Updates an existing event on the user's primary Google Calendar.
   * Replaces the event's title, description, and time range.
   *
   * @param eventId - The Google Calendar event ID to update
   * @param summary - New event title
   * @param startDateTime - New start time as ISO 8601 string
   * @param endDateTime - New end time as ISO 8601 string
   * @param description - Optional new description
   */
  const updateEvent = useCallback(
    async (eventId: string, summary: string, startDateTime: string, endDateTime: string, description?: string) => {
      await ensureToken()

      await window.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId,
        resource: {
          summary,
          description: description || undefined,
          start: { dateTime: startDateTime },
          end: { dateTime: endDateTime },
        },
      })
    },
    [ensureToken],
  )

  /**
   * Deletes an event from the user's primary Google Calendar.
   *
   * @param eventId - The Google Calendar event ID to delete
   */
  const deleteEvent = useCallback(
    async (eventId: string) => {
      await ensureToken()

      await window.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId,
      })
    },
    [ensureToken],
  )

  return { isSignedIn, events, loading, error, signIn, signOut, fetchEvents, createEvent, updateEvent, deleteEvent }
}
