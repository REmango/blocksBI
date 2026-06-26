import type { AgentEventName } from './constants'

export { AGENT_EVENTS } from './constants'
export type { AgentEventName }

// ---------------------------------------------------------------------------
// SharedWorker ↔ Tab (MessagePort)
// ---------------------------------------------------------------------------

export type WorkerCommandType =
  | 'connect'
  | 'disconnect'
  | 'emit'
  | 'get-status'
  | 'ping'
  | 'acquire-dashboard'
  | 'release-dashboard'
  | 'set-network-online'

export type WorkerReplyType =
  | 'connected'
  | 'disconnected'
  | 'status'
  | 'ack'
  | 'error'
  | 'pong'

export interface WorkerCommand {
  type: WorkerCommandType
  requestId: string
  payload?: unknown
}

export interface WorkerReply {
  type: WorkerReplyType
  requestId: string
  payload?: unknown
  error?: { code: string; message: string }
}

export interface ConnectPayload {
  url?: string
  namespace?: string
}

export interface EmitPayload {
  event: string
  data?: unknown
}

export interface ConnectionStatus {
  connected: boolean
  socketId?: string
  url?: string
  namespace?: string
}

// ---------------------------------------------------------------------------
// BroadcastChannel (cross-tab fan-out)
// ---------------------------------------------------------------------------

export type BroadcastMessageType = 'connection' | 'server-event'

export interface BroadcastMessage {
  type: BroadcastMessageType
  event?: string
  payload?: unknown
  timestamp: number
}

// ---------------------------------------------------------------------------
// Agent DTOs — aligned with server
// ---------------------------------------------------------------------------

export interface AgentSessionDto {
  id: string
  sessionId: string
  userId: string
  dashboardId: string
  sessionTitle: string
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface AgentMessageDto {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  createdAt: string
}

export interface AgentErrorPayload {
  code: string
  message: string
}

export interface AckResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: AgentErrorPayload
}

export interface MessageStreamPayload {
  sessionId: string
  messageId: string
  chunk: string
  done: boolean
}

export interface RoomJoinPayload {
  dashboardId: string
  sessionId: string
}

export interface MessageSendPayload {
  sessionId: string
  content: string
}

export type AgentEventHandler<T = unknown> = (payload: T) => void
