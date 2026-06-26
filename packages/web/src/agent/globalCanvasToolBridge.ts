import { CANVAS_TOOL_EVENTS, type RemoteToolAck, type RemoteToolRequest } from './constants'
import { executeCanvasTool } from './canvas-tool-handlers'
import { ensureBiAgentConnected, ensureAgentSession, getWsClient } from '@/ws'
import { getActiveSessionId, setActiveSessionId } from '@/ws/agent-session-sync'

let registered = false
let activeDashboardId: string | undefined

export function setCanvasToolBridgeDashboard(dashboardId: string | undefined): void {
  activeDashboardId = dashboardId
}

/** Register a single global listener — survives React remounts and avoids effect timing gaps. */
export function ensureGlobalCanvasToolBridge(): void {
  if (registered) return
  registered = true

  const ws = getWsClient()
  ws.init()

  ws.on<RemoteToolRequest>(CANVAS_TOOL_EVENTS.TOOL_EXECUTE, (request) => {
    void handleRemoteToolRequest(request)
  })

  console.log('[canvas-tool-bridge] global listener registered')
}

async function sendAck(ack: RemoteToolAck): Promise<void> {
  const ws = getWsClient()
  ws.init()

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await ensureBiAgentConnected()
      await ws.emit(CANVAS_TOOL_EVENTS.TOOL_ACK, ack)
      console.log('[canvas-tool-bridge] ack sent:', ack.requestId, ack.ok ? 'ok' : ack.error)
      return
    } catch (error) {
      if (attempt === 0) {
        console.warn('[canvas-tool-bridge] ack retry after connect:', error)
        continue
      }
      console.error('[canvas-tool-bridge] failed to send ack:', error)
    }
  }
}

async function handleRemoteToolRequest(request: RemoteToolRequest): Promise<void> {
  const ack: RemoteToolAck = {
    requestId: request.requestId,
    ok: false,
  }

  const dashboardId = activeDashboardId
  let sessionId = dashboardId ? getActiveSessionId(dashboardId) : null

  if (!sessionId && dashboardId) {
    try {
      const session = await ensureAgentSession(dashboardId)
      sessionId = session.sessionId
      setActiveSessionId(dashboardId, sessionId)
    } catch (error) {
      ack.error = 'Canvas tool bridge not ready (failed to resolve session)'
      console.warn('[canvas-tool-bridge] skip — session resolve failed', { dashboardId, error, request })
      await sendAck(ack)
      return
    }
  }

  if (!dashboardId || !sessionId) {
    ack.error = 'Canvas tool bridge not ready (missing dashboard or session)'
    console.warn('[canvas-tool-bridge] skip — not ready', { dashboardId, sessionId, request })
    await sendAck(ack)
    return
  }

  if (request.sessionId !== sessionId) {
    // Another tab/session owns this request — do not ACK (would resolve wrong pending promise).
    console.warn('[canvas-tool-bridge] skip — session mismatch', {
      expected: sessionId,
      got: request.sessionId,
      tool: request.toolName,
    })
    return
  }

  console.log('[canvas-tool-bridge] execute:', request.toolName, request.requestId, request.input)

  try {
    ack.result = await executeCanvasTool(request.toolName, request.input ?? {})
    ack.ok = true
  } catch (error) {
    ack.error = error instanceof Error ? error.message : 'Canvas tool execution failed'
  }

  await sendAck(ack)
}
