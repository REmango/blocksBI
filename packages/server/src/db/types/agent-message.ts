import type { Types } from 'mongoose'

export type AgentMessageRole = 'user' | 'assistant' | 'tool'

export interface AgentMessage {
  _id: Types.ObjectId
  sessionId: string
  role: AgentMessageRole
  content: string
  createdAt: Date
}

export type AgentMessageInsert = Omit<AgentMessage, '_id' | 'createdAt'> & {
  createdAt?: Date
}
