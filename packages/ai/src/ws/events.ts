/** WebSocket events for remote BI tool invocation. */
export const WS_TOOL_EVENTS = {
  /** Server → frontend: request tool execution */
  TOOL_EXECUTE: 'agent:tool:execute',
  /** Frontend → server: execution result ACK */
  TOOL_ACK: 'agent:tool:ack',
  /** Frontend → server: intermediate progress (optional) */
  TOOL_PROGRESS: 'agent:tool:progress',
} as const

export type WsToolEventName = (typeof WS_TOOL_EVENTS)[keyof typeof WS_TOOL_EVENTS]

/** Default executor channel registered via ToolRegistry. */
export const DEFAULT_WS_EXECUTOR_CHANNEL = 'bi_ws'
