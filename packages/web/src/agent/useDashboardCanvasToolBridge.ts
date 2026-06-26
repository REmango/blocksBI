import { useEffect, useRef } from 'react'
import { useParams } from 'react-router'

import {
  ensureAgentSession,
  getWsClient,
  joinBiAgentRooms,
  setActiveSessionId,
  subscribeAgentSessionSync,
} from '@/ws'

import {
  ensureGlobalCanvasToolBridge,
  setCanvasToolBridgeDashboard,
} from './globalCanvasToolBridge'

const REJOIN_DEBOUNCE_MS = 500

/**
 * Dashboard-level canvas tool bridge — keeps session rooms joined after reconnect.
 * WS connect/disconnect is owned by bindDashboardWsLifecycle() on the dashboard page.
 */
export function useDashboardCanvasToolBridge(): void {
  const { dashboardId } = useParams<{ dashboardId: string }>()
  const sessionIdRef = useRef<string | null>(null)
  const rejoinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setCanvasToolBridgeDashboard(dashboardId)
    ensureGlobalCanvasToolBridge()

    return () => {
      setCanvasToolBridgeDashboard(undefined)
    }
  }, [dashboardId])

  useEffect(() => {
    if (!dashboardId) return

    let cancelled = false

    const rejoinRooms = async (sessionId: string) => {
      const ws = getWsClient()
      const status = await ws.getStatus()
      if (!status.connected) return

      sessionIdRef.current = sessionId
      setActiveSessionId(dashboardId, sessionId)
      await joinBiAgentRooms({ dashboardId, sessionId })
      console.log('[dashboard-canvas-tool-bridge] joined rooms:', dashboardId, sessionId)
    }

    const scheduleRejoin = (sessionId: string) => {
      if (rejoinTimerRef.current) {
        clearTimeout(rejoinTimerRef.current)
      }
      rejoinTimerRef.current = setTimeout(() => {
        rejoinTimerRef.current = null
        if (cancelled) return
        void rejoinRooms(sessionId).catch((error) => {
          console.error('[dashboard-canvas-tool-bridge] rejoin failed:', error)
        })
      }, REJOIN_DEBOUNCE_MS)
    }

    const resolveSessionId = async (): Promise<string | null> => {
      if (sessionIdRef.current) {
        return sessionIdRef.current
      }

      try {
        const session = await ensureAgentSession(dashboardId)
        if (cancelled) return null
        sessionIdRef.current = session.sessionId
        return session.sessionId
      } catch (error) {
        console.error('[dashboard-canvas-tool-bridge] resolve session failed:', error)
        return null
      }
    }

    void resolveSessionId().then((sessionId) => {
      if (cancelled || !sessionId) return
      void rejoinRooms(sessionId).catch((error) => {
        console.error('[dashboard-canvas-tool-bridge] init rejoin failed:', error)
      })
    })

    const ws = getWsClient()
    ws.init()

    const unsubReconnect = ws.onConnectionChange((status) => {
      if (!status.connected) return
      void resolveSessionId().then((sessionId) => {
        if (!sessionId || cancelled) return
        scheduleRejoin(sessionId)
      })
    })

    const unsubSync = subscribeAgentSessionSync((message) => {
      if (message.dashboardId !== dashboardId || message.type !== 'session-changed') return
      sessionIdRef.current = message.sessionId
      scheduleRejoin(message.sessionId)
    })

    return () => {
      cancelled = true
      if (rejoinTimerRef.current) {
        clearTimeout(rejoinTimerRef.current)
        rejoinTimerRef.current = null
      }
      unsubReconnect()
      unsubSync()
    }
  }, [dashboardId])
}
