import { useState, useEffect, useCallback, useRef } from 'react'

const CLIENT_ID = '1000515780562-69b88otiani2shoq45qeue1mdj5unick.apps.googleusercontent.com'
const SCOPES = 'https://www.googleapis.com/auth/calendar.events'
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'

export interface GCalEvent {
  id: string
  summary: string
  start: string      // ISO datetime
  end: string        // ISO datetime
  allDay: boolean
  location?: string
  description?: string
  colorId?: string
}

// Extend window for gapi / google globals
declare global {
  interface Window {
    gapi: any
    google: any
  }
}

/** Wait for a global to be available (script async loading) */
function waitForGlobal(key: 'gapi' | 'google', timeout = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window[key]) return resolve()
    const start = Date.now()
    const check = setInterval(() => {
      if (window[key]) { clearInterval(check); resolve() }
      else if (Date.now() - start > timeout) { clearInterval(check); reject(new Error(`${key} script failed to load`)) }
    }, 100)
  })
}

export function useGoogleCalendar() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [events, setEvents] = useState<GCalEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const gapiInited = useRef(false)
  const tokenClientRef = useRef<any>(null)
  const fetchResolveRef = useRef<(() => void) | null>(null)

  // Initialize gapi client
  const initGapi = useCallback(async () => {
    if (gapiInited.current) return
    await waitForGlobal('gapi')
    await new Promise<void>((resolve) => window.gapi.load('client', resolve))
    await window.gapi.client.init({
      discoveryDocs: [DISCOVERY_DOC],
    })
    gapiInited.current = true

    // Check if we have a stored token with the correct scope
    const stored = localStorage.getItem('gcal_token')
    if (stored) {
      try {
        const token = JSON.parse(stored)
        // Check token is valid (has > 60s left) AND has the right scope
        if (
          token.expires_at && token.expires_at > Date.now() + 60_000
          && token.scope === SCOPES
        ) {
          window.gapi.client.setToken({ access_token: token.access_token })
          setIsSignedIn(true)
        } else {
          localStorage.removeItem('gcal_token')
        }
      } catch {
        localStorage.removeItem('gcal_token')
      }
    }
  }, [])

  // Initialize GIS token client
  const initTokenClient = useCallback(async () => {
    if (tokenClientRef.current) return
    await waitForGlobal('google')
    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error) {
          setError(response.error)
          return
        }
        // Store token with expiry and scope
        const tokenData = {
          access_token: response.access_token,
          expires_at: Date.now() + response.expires_in * 1000,
          scope: SCOPES,
        }
        localStorage.setItem('gcal_token', JSON.stringify(tokenData))
        setIsSignedIn(true)
        setError(null)
        // If there's a pending fetch, resolve it
        if (fetchResolveRef.current) {
          fetchResolveRef.current()
          fetchResolveRef.current = null
        }
      },
    })
  }, [])

  useEffect(() => {
    initGapi().catch((err) => setError(err.message))
    initTokenClient().catch((err) => setError(err.message))
  }, [initGapi, initTokenClient])

  /** Prompt the user to sign in */
  const signIn = useCallback(() => {
    if (!tokenClientRef.current) return
    tokenClientRef.current.requestAccessToken({ prompt: 'consent' })
  }, [])

  /** Sign out and clear stored token */
  const signOut = useCallback(() => {
    const token = window.gapi?.client?.getToken?.()
    if (token) {
      window.google?.accounts?.oauth2?.revoke?.(token.access_token)
      window.gapi.client.setToken(null)
    }
    localStorage.removeItem('gcal_token')
    setIsSignedIn(false)
    setEvents([])
  }, [])

  /** Fetch events for a date range. If not signed in, triggers sign-in first. */
  const fetchEvents = useCallback(
    async (timeMin: string, timeMax: string) => {
      setLoading(true)
      setError(null)

      try {
        // Make sure gapi is ready
        if (!gapiInited.current) await initGapi()

        // If not signed in, trigger sign in and wait for callback
        if (!window.gapi.client.getToken()) {
          if (!tokenClientRef.current) await initTokenClient()
          await new Promise<void>((resolve) => {
            fetchResolveRef.current = resolve
            tokenClientRef.current.requestAccessToken({ prompt: '' })
          })
        }

        const response = await window.gapi.client.calendar.events.list({
          calendarId: 'primary',
          timeMin: new Date(timeMin).toISOString(),
          timeMax: new Date(timeMax).toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 250,
        })

        const items: GCalEvent[] = (response.result.items || []).map((item: any) => ({
          id: item.id,
          summary: item.summary || '(No title)',
          start: item.start.dateTime || item.start.date,
          end: item.end.dateTime || item.end.date,
          allDay: !item.start.dateTime,
          location: item.location,
          description: item.description,
          colorId: item.colorId,
        }))

        setEvents(items)
      } catch (err: any) {
        // If 401, token expired — clear and retry once
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
    [initGapi, initTokenClient],
  )

  /** Create a single calendar event. Returns the created event id. */
  const createEvent = useCallback(
    async (summary: string, startDateTime: string, endDateTime: string, description?: string) => {
      if (!gapiInited.current) await initGapi()

      // Ensure we have a token
      if (!window.gapi.client.getToken()) {
        if (!tokenClientRef.current) await initTokenClient()
        await new Promise<void>((resolve) => {
          fetchResolveRef.current = resolve
          tokenClientRef.current.requestAccessToken({ prompt: '' })
        })
      }

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary,
          description: description || undefined,
          start: { dateTime: startDateTime },
          end: { dateTime: endDateTime },
        },
      })

      return response.result.id as string
    },
    [initGapi, initTokenClient],
  )

  /** Update an existing calendar event. */
  const updateEvent = useCallback(
    async (eventId: string, summary: string, startDateTime: string, endDateTime: string, description?: string) => {
      if (!gapiInited.current) await initGapi()

      if (!window.gapi.client.getToken()) {
        if (!tokenClientRef.current) await initTokenClient()
        await new Promise<void>((resolve) => {
          fetchResolveRef.current = resolve
          tokenClientRef.current.requestAccessToken({ prompt: '' })
        })
      }

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
    [initGapi, initTokenClient],
  )

  /** Delete a calendar event. */
  const deleteEvent = useCallback(
    async (eventId: string) => {
      if (!gapiInited.current) await initGapi()

      if (!window.gapi.client.getToken()) {
        if (!tokenClientRef.current) await initTokenClient()
        await new Promise<void>((resolve) => {
          fetchResolveRef.current = resolve
          tokenClientRef.current.requestAccessToken({ prompt: '' })
        })
      }

      await window.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId,
      })
    },
    [initGapi, initTokenClient],
  )

  return { isSignedIn, events, loading, error, signIn, signOut, fetchEvents, createEvent, updateEvent, deleteEvent }
}
