import { assertSessionId } from '../utils/session-id'
import {
  getAgentSession,
  toMessageDto,
} from '../services/agent.service'
import {
  cancelAgentSession,
  getAgentRuntime,
  runAgentTurn,
} from '../agent/agent-runtime'
import { AgentMessageModel, AgentSessionModel } from '../db/models'
import {
  dashboardRoom,
  sessionRoom,
  userRoom,
} from '../constants/admin'
import type { Namespace, Socket } from 'socket.io'

import {
  AGENT_EVENTS,
  type AckResponse,
  type AgentMessageDto,
  type MessageCancelPayload,
  type MessageSendPayload,
  type RoomJoinPayload,
} from './events'

const MAX_JOINED_ROOMS_PER_SOCKET = 100

class RoomJoinLimitError extends Error {
  readonly code = 'ROOM_LIMIT_EXCEEDED'

  constructor(limit = MAX_JOINED_ROOMS_PER_SOCKET) {
    super(`Room join limit exceeded (max ${limit})`)
    this.name = 'RoomJoinLimitError'
  }
}

interface AgentSocketData {
  agentSessions?: Set<string>
  boundDashboardId?: string
  boundSessionId?: string
}

function getSocketData(socket: Socket): AgentSocketData {
  return socket.data as AgentSocketData
}

function getSocketSessions(socket: Socket): Set<string> {
  const data = getSocketData(socket)
  if (!data.agentSessions) {
    data.agentSessions = new Set<string>()
  }
  return data.agentSessions
}

function isAgentScopedRoom(room: string, socket: Socket): boolean {
  return room !== socket.id && (room.startsWith('dashboard:') || room.startsWith('session:'))
}

function countJoinedRooms(socket: Socket): number {
  let count = 0
  for (const room of socket.rooms) {
    if (room !== socket.id) count++
  }
  return count
}

function countRoomsToAdd(socket: Socket, dashboardId: string, sessionId: string): number {
  const { dashboard, session } = resolveJoinRooms(dashboardId, sessionId)
  return Number(!socket.rooms.has(dashboard)) + Number(!socket.rooms.has(session))
}

/** Fail closed when a socket would exceed the per-user room cap. */
function enforceJoinedRoomLimit(
  socket: Socket,
  dashboardId: string,
  sessionId: string,
): void {
  const roomsToAdd = countRoomsToAdd(socket, dashboardId, sessionId)
  if (roomsToAdd === 0) return

  if (countJoinedRooms(socket) + roomsToAdd > MAX_JOINED_ROOMS_PER_SOCKET) {
    throw new RoomJoinLimitError()
  }
}

/** Release in-flight agent work and leave dashboard/session rooms from a prior binding. */
function cleanupPreviousRoomBinding(socket: Socket, reason = 'Room rebinding'): void {
  const sessions = getSocketSessions(socket)
  for (const sessionId of sessions) {
    cancelAgentSession(sessionId, reason)
  }
  sessions.clear()

  for (const room of socket.rooms) {
    if (isAgentScopedRoom(room, socket)) {
      void socket.leave(room)
    }
  }

  const data = getSocketData(socket)
  data.boundDashboardId = undefined
  data.boundSessionId = undefined
}

function markRoomBinding(socket: Socket, dashboardId: string, sessionId: string): void {
  const data = getSocketData(socket)
  data.boundDashboardId = dashboardId
  data.boundSessionId = sessionId
}

function resolveJoinRooms(dashboardId: string, sessionId: string): {
  dashboard: string
  session: string
} {
  return {
    dashboard: dashboardRoom(dashboardId),
    session: sessionRoom(sessionId),
  }
}

/** Skip socket.join when the connection is already in both target rooms. */
function isAlreadyInRooms(
  socket: Socket,
  dashboardId: string,
  sessionId: string,
): boolean {
  const { dashboard, session } = resolveJoinRooms(dashboardId, sessionId)
  return socket.rooms.has(dashboard) && socket.rooms.has(session)
}

function joinAgentRooms(
  socket: Socket,
  dashboardId: string,
  sessionId: string,
): 'joined' | 'already-joined' {
  if (isAlreadyInRooms(socket, dashboardId, sessionId)) {
    getSocketSessions(socket).add(sessionId)
    markRoomBinding(socket, dashboardId, sessionId)
    return 'already-joined'
  }

  const roomsToAdd = countRoomsToAdd(socket, dashboardId, sessionId)
  const overLimit =
    countJoinedRooms(socket) + roomsToAdd > MAX_JOINED_ROOMS_PER_SOCKET

  cleanupPreviousRoomBinding(
    socket,
    overLimit ? 'Room limit exceeded' : 'Room rebinding',
  )
  enforceJoinedRoomLimit(socket, dashboardId, sessionId)

  const { dashboard, session } = resolveJoinRooms(dashboardId, sessionId)
  socket.join(dashboard)
  socket.join(session)
  getSocketSessions(socket).add(sessionId)
  markRoomBinding(socket, dashboardId, sessionId)
  return 'joined'
}

function emitError(socket: Socket, code: string, message: string): void {
  socket.emit(AGENT_EVENTS.ERROR, { code, message })
}

function ackError<T>(message: string, code = 'BAD_REQUEST'): AckResponse<T> {
  return { ok: false, error: { code, message } }
}

function resolveJoinError(error: unknown, fallbackCode: string): { code: string; message: string } {
  if (error instanceof RoomJoinLimitError) {
    return { code: error.code, message: error.message }
  }
  const message = error instanceof Error ? error.message : 'Unknown error'
  return { code: fallbackCode, message }
}

export function registerAgentHandlers(io: Namespace, socket: Socket, adminUserId: string): void {
  getAgentRuntime().wsToolService.bindSocketListeners(socket)
  socket.join(userRoom(adminUserId))

  if (countJoinedRooms(socket) > MAX_JOINED_ROOMS_PER_SOCKET) {
    cleanupPreviousRoomBinding(socket, 'Room limit exceeded')
  }

  socket.on(
    AGENT_EVENTS.ROOM_JOIN,
    async (payload: RoomJoinPayload, ack?: (response: AckResponse) => void) => {
      try {
        const sessionId = assertSessionId(payload.sessionId)
        const session = await getAgentSession(sessionId)

        if (!session) {
          const message = 'Session not found'
          emitError(socket, 'SESSION_NOT_FOUND', message)
          ack?.(ackError(message, 'NOT_FOUND'))
          return
        }

        const joinResult = joinAgentRooms(socket, payload.dashboardId, sessionId)
        ack?.({ ok: true, data: { duplicate: joinResult === 'already-joined' } })
      } catch (error) {
        const { code, message } = resolveJoinError(error, 'ROOM_JOIN_FAILED')
        emitError(socket, code, message)
        ack?.(ackError(message, code))
      }
    },
  )

  socket.on(
    AGENT_EVENTS.MESSAGE_SEND,
    async (payload: MessageSendPayload, ack?: (response: AckResponse<AgentMessageDto>) => void) => {
      try {
        const sessionId = assertSessionId(payload.sessionId)
        const content = payload.content?.trim()

        if (!content) {
          const message = 'Message content is required'
          emitError(socket, 'MESSAGE_EMPTY', message)
          ack?.(ackError(message))
          return
        }

        const session = await getAgentSession(sessionId)
        if (!session) {
          const message = 'Session not found'
          emitError(socket, 'SESSION_NOT_FOUND', message)
          ack?.(ackError(message, 'NOT_FOUND'))
          return
        }

        if (session.status === 'archived') {
          const message = 'Session is archived'
          emitError(socket, 'SESSION_ARCHIVED', message)
          ack?.(ackError(message, 'FORBIDDEN'))
          return
        }

        const userMessage = await AgentMessageModel.create({
          sessionId,
          role: 'user',
          content,
        })

        await AgentSessionModel.updateOne({ sessionId }, { updatedAt: new Date() })

        const userDto = toMessageDto(userMessage)
        const room = sessionRoom(sessionId)

        joinAgentRooms(socket, session.dashboardId, sessionId)
        io.to(room).emit(AGENT_EVENTS.MESSAGE_RECEIVED, userDto)
        ack?.({ ok: true, data: userDto })

        try {
          await runAgentTurn({
            io,
            session,
            userContent: content,
            socketSessions: getSocketSessions(socket),
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Agent run failed'
          emitError(socket, 'AGENT_RUN_FAILED', message)
        }
      } catch (error) {
        const { code, message } = resolveJoinError(error, 'MESSAGE_SEND_FAILED')
        emitError(socket, code, message)
        ack?.(ackError(message, code))
      }
    },
  )

  socket.on(
    AGENT_EVENTS.MESSAGE_CANCEL,
    async (payload: MessageCancelPayload, ack?: (response: AckResponse) => void) => {
      try {
        const sessionId = assertSessionId(payload.sessionId)
        cancelAgentSession(sessionId)
        ack?.({ ok: true })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to cancel agent run'
        ack?.(ackError(message))
      }
    },
  )

  socket.on('disconnect', () => {
    cleanupPreviousRoomBinding(socket, 'Session disconnected')
  })
}
