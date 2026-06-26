/** WS tool events — aligned with @block-bi/ai WS_TOOL_EVENTS */
export const CANVAS_TOOL_EVENTS = {
  TOOL_EXECUTE: 'agent:tool:execute',
  TOOL_ACK: 'agent:tool:ack',
  TOOL_PROGRESS: 'agent:tool:progress',
} as const

export interface RemoteToolRequest {
  requestId: string
  sessionId: string
  dashboardId: string
  toolName: string
  input: Record<string, unknown>
  timeoutMs: number
}

export interface RemoteToolAck {
  requestId: string
  ok: boolean
  result?: string
  error?: string
}
