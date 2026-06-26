import mongoose from 'mongoose'

import { AgentMessageModel, AgentSessionModel } from '../db/models'
import type { AgentMessageDocument, AgentSessionDocument } from '../db/models'
import { getAdminUserId } from '../constants/admin'
import { assertDashboardId } from '../utils/dashboard-id'
import { createSessionId } from '../utils/session-id'
import { truncateMessageContent } from '../utils/message-content'

import type { AgentMessageDto, AgentSessionDto } from '../socket/events'

function toObjectId(id: string, field: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${field}`)
  }
  return new mongoose.Types.ObjectId(id)
}

export function toSessionDto(doc: AgentSessionDocument): AgentSessionDto {
  return {
    id: doc.sessionId,
    sessionId: doc.sessionId,
    userId: doc.userId.toString(),
    dashboardId: doc.dashboardId,
    sessionTitle: doc.sessionTitle,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

export function toMessageDto(doc: AgentMessageDocument): AgentMessageDto {
  return {
    id: doc._id.toString(),
    sessionId: doc.sessionId,
    role: doc.role,
    content: truncateMessageContent(doc.content ?? ''),
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function createAgentSession(
  dashboardId: string,
  sessionTitle = '新会话',
): Promise<AgentSessionDto> {
  const userId = await getAdminUserId()
  const normalizedDashboardId = assertDashboardId(dashboardId)

  const session = await AgentSessionModel.create({
    sessionId: createSessionId(),
    userId: toObjectId(userId, 'userId'),
    dashboardId: normalizedDashboardId,
    sessionTitle,
    status: 'active',
  })

  return toSessionDto(session)
}

export async function listAgentSessions(
  dashboardId: string,
  status: 'active' | 'archived' = 'active',
): Promise<AgentSessionDto[]> {
  const userId = await getAdminUserId()
  const normalizedDashboardId = assertDashboardId(dashboardId)

  const sessions = await AgentSessionModel.find({
    userId: toObjectId(userId, 'userId'),
    dashboardId: normalizedDashboardId,
    status,
  })
    .sort({ updatedAt: -1 })
    .limit(50)

  return sessions.map(toSessionDto)
}

export async function getAgentSession(sessionId: string): Promise<AgentSessionDto | null> {
  const session = await AgentSessionModel.findOne({ sessionId })
  return session ? toSessionDto(session) : null
}

export async function archiveAgentSession(sessionId: string): Promise<AgentSessionDto | null> {
  const session = await AgentSessionModel.findOneAndUpdate(
    { sessionId },
    { status: 'archived' },
    { new: true },
  )

  return session ? toSessionDto(session) : null
}

export async function updateAgentSessionTitle(
  sessionId: string,
  sessionTitle: string,
): Promise<AgentSessionDto | null> {
  const trimmedTitle = sessionTitle.trim()
  if (!trimmedTitle) {
    throw new Error('Session title is required')
  }

  const session = await AgentSessionModel.findOneAndUpdate(
    { sessionId },
    { sessionTitle: trimmedTitle, updatedAt: new Date() },
    { new: true },
  )

  return session ? toSessionDto(session) : null
}

export async function listAgentMessages(sessionId: string): Promise<AgentMessageDto[]> {
  const messages = await AgentMessageModel.find({ sessionId })
    .sort({ createdAt: 1 })
    .limit(80)
    .select({ sessionId: 1, role: 1, content: 1, createdAt: 1 })
    .lean()

  return messages.map((doc) => ({
    id: doc._id.toString(),
    sessionId: doc.sessionId,
    role: doc.role,
    content: truncateMessageContent(doc.content ?? ''),
    createdAt: doc.createdAt.toISOString(),
  }))
}
