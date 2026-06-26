import { useEffect, useRef } from 'react'

import { getWsClient } from '@/ws'

import { CANVAS_TOOL_EVENTS, type RemoteToolAck, type RemoteToolRequest } from './constants'
import { executeCanvasTool } from './canvas-tool-handlers'

export interface UseCanvasToolBridgeOptions {
  enabled: boolean
  dashboardId?: string
  sessionId?: string
  onToolStart?: (toolName: string) => void
  onToolEnd?: () => void
}

/**
 * Listens for agent:tool:execute on the bi-agent socket and runs tools against Zustand canvas state.
 */
export function useCanvasToolBridge(options: UseCanvasToolBridgeOptions): void {
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    if (!options.enabled || !options.dashboardId || !options.sessionId) return

    const ws = getWsClient()

    const unsubscribe = ws.on<RemoteToolRequest>(CANVAS_TOOL_EVENTS.TOOL_EXECUTE, (request) => {
      const { dashboardId, sessionId, onToolStart, onToolEnd } = optionsRef.current

      if (!dashboardId || !sessionId) return
      if (request.dashboardId !== dashboardId) return
      if (request.sessionId !== sessionId) return

      void (async () => {
        onToolStart?.(request.toolName)
        console.log('[canvas-tool-bridge] execute:', request.toolName, request.requestId)

        const ack: RemoteToolAck = {
          requestId: request.requestId,
          ok: false,
        }

        try {
          const result = await executeCanvasTool(request.toolName, request.input ?? {})
          ack.ok = true
          ack.result = result
        } catch (error) {
          ack.error = error instanceof Error ? error.message : 'Canvas tool execution failed'
        }

        try {
          await ws.emit(CANVAS_TOOL_EVENTS.TOOL_ACK, ack)
        } catch (emitError) {
          console.error('[canvas-tool-bridge] failed to send ack:', emitError)
        } finally {
          onToolEnd?.()
        }
      })()
    })

    return unsubscribe
  }, [options.enabled, options.dashboardId, options.sessionId])
}
