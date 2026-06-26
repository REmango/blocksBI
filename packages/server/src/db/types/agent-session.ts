import type { Types } from 'mongoose'

export type AgentSessionStatus = 'active' | 'archived'

export interface AgentSession {
  _id: Types.ObjectId
  sessionId: string
  userId: Types.ObjectId
  dashboardId: string
  sessionTitle: string
  status: AgentSessionStatus
  createdAt: Date
  updatedAt: Date
}

export type AgentSessionInsert = Omit<
  AgentSession,
  '_id' | 'sessionId' | 'createdAt' | 'updatedAt' | 'status'
> & {
  sessionId?: string
  status?: AgentSessionStatus
  createdAt?: Date
  updatedAt?: Date
}

export type AgentSessionUpdate = Partial<Omit<AgentSession, '_id' | 'userId' | 'createdAt'>>
