/** Result returned by the frontend after executing a remote BI tool. */
export interface RemoteToolAck {
  requestId: string
  ok: boolean
  result?: string
  error?: string
}

/** Payload sent to the frontend via WebSocket for tool execution. */
export interface RemoteToolRequest {
  requestId: string
  sessionId: string
  dashboardId: string
  toolName: string
  input: Record<string, unknown>
  timeoutMs: number
}

export interface RemoteToolProgress {
  requestId: string
  sessionId: string
  message: string
}
