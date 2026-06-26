export const BI_AGENT_NAMESPACE = '/bi-agent'

export const AGENT_EVENTS = {
  ROOM_JOIN: 'agent:room:join',
  MESSAGE_SEND: 'agent:message:send',
  MESSAGE_CANCEL: 'agent:message:cancel',

  MESSAGE_RECEIVED: 'agent:message:received',
  MESSAGE_STREAM: 'agent:message:stream',
  MESSAGE_COMPLETE: 'agent:message:complete',
  ERROR: 'agent:error',
} as const

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

export interface RoomJoinPayload {
  dashboardId: string
  sessionId: string
}

export interface MessageSendPayload {
  sessionId: string
  content: string
}

export interface MessageCancelPayload {
  sessionId: string
}

export interface MessageStreamPayload {
  sessionId: string
  messageId: string
  chunk: string
  done: boolean
}

export interface AckResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: AgentErrorPayload
}
