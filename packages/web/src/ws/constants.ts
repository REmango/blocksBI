/** BroadcastChannel name — shared by tabs and SharedWorker */
export const WS_BROADCAST_CHANNEL = 'blocksbi-ws'

/** SharedWorker registration name */
export const WS_SHARED_WORKER_NAME = 'blocksbi-ws-shared-worker'

/** Default Socket.IO / HTTP server URL */
export const DEFAULT_WS_URL =
  import.meta.env.VITE_WS_URL ?? 'http://localhost:3001'

export const DEFAULT_API_URL =
  import.meta.env.VITE_API_URL ?? DEFAULT_WS_URL

/** Socket.IO namespace for BI Agent */
export const BI_AGENT_NAMESPACE = '/bi-agent'

/** Agent WS events — aligned with server `socket/events.ts` */
export const AGENT_EVENTS = {
  ROOM_JOIN: 'agent:room:join',
  MESSAGE_SEND: 'agent:message:send',
  MESSAGE_CANCEL: 'agent:message:cancel',

  MESSAGE_RECEIVED: 'agent:message:received',
  MESSAGE_STREAM: 'agent:message:stream',
  MESSAGE_COMPLETE: 'agent:message:complete',
  ERROR: 'agent:error',
} as const

export type AgentEventName = (typeof AGENT_EVENTS)[keyof typeof AGENT_EVENTS]

/** WS tool events — aligned with @block-bi/ai */
export const CANVAS_TOOL_EVENTS = {
  TOOL_EXECUTE: 'agent:tool:execute',
  TOOL_ACK: 'agent:tool:ack',
  TOOL_PROGRESS: 'agent:tool:progress',
} as const

/** Server push events forwarded through BroadcastChannel */
export const SERVER_PUSH_EVENTS = new Set<string>([
  'pong',
  ...Object.values(AGENT_EVENTS),
  ...Object.values(CANVAS_TOOL_EVENTS),
])
