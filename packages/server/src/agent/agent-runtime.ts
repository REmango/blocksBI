import {
  BiModelManager,
  BiWsToolExecutor,
  DEFAULT_WS_EXECUTOR_CHANNEL,
  PendingRequestRegistry,
  ToolRegistry,
  WsToolService,
  biAgentLoop,
} from '@block-bi/ai'
import mongoose from 'mongoose'
import type { Namespace } from 'socket.io'

import { sessionRoom } from '../constants/admin'
import { AgentMessageModel, AgentSessionModel } from '../db/models'
import { getDashboard } from '../services/dashboard.service'
import { toMessageDto } from '../services/agent.service'
import type { AgentSessionDto } from '../socket/events'
import { AGENT_EVENTS } from '../socket/events'

import { buildDashboardContext } from './dashboard-context'
import { clearSessionState, getSessionState, setSessionState } from './session-state'
import { truncateMessageContent } from '../utils/message-content'

export interface AgentRuntime {
  modelManager: BiModelManager | null
  wsToolService: WsToolService
}

let runtime: AgentRuntime | null = null

const sessionRuns = new Map<string, AbortController>()

function trackSession(socketSessions: Set<string> | undefined, sessionId: string): void {
  socketSessions?.add(sessionId)
}

function registerSessionRun(sessionId: string, abort: AbortController): void {
  const previous = sessionRuns.get(sessionId)
  if (previous) {
    previous.abort()
  }
  sessionRuns.set(sessionId, abort)
}

function unregisterSessionRun(sessionId: string, abort: AbortController): void {
  if (sessionRuns.get(sessionId) === abort) {
    sessionRuns.delete(sessionId)
  }
}

export function initAgentRuntime(namespace: Namespace): AgentRuntime {
  const pendingRegistry = new PendingRequestRegistry()
  const wsToolService = new WsToolService(namespace, {
    pendingRegistry,
    sessionRoom,
  })

  ToolRegistry.registerExecutor(DEFAULT_WS_EXECUTOR_CHANNEL, new BiWsToolExecutor(wsToolService))

  let modelManager: BiModelManager | null = null
  try {
    modelManager = BiModelManager.create()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to initialize model manager'
    console.warn('[agent-runtime] model manager unavailable:', message)
  }

  runtime = { modelManager, wsToolService }
  return runtime
}

export function getAgentRuntime(): AgentRuntime {
  if (!runtime) {
    throw new Error('Agent runtime not initialized. Call initAgentRuntime() at socket startup.')
  }
  return runtime
}

export function cancelAgentSession(sessionId: string, reason = 'Session disconnected'): void {
  sessionRuns.get(sessionId)?.abort()
  sessionRuns.delete(sessionId)
  runtime?.wsToolService.cancelSession(sessionId, reason)
  clearSessionState(sessionId)
}

export async function runAgentTurn(params: {
  io: Namespace
  session: AgentSessionDto
  userContent: string
  socketSessions?: Set<string>
}): Promise<void> {
  const { io, session, userContent, socketSessions } = params
  const { modelManager } = getAgentRuntime()

  trackSession(socketSessions, session.sessionId)

  if (!modelManager) {
    throw new Error(
      'No model configured. Set BLOCKSBI_MODEL or a provider API key (e.g. DEEPSEEK_API_KEY).',
    )
  }

  const dashboardData = await getDashboard(session.dashboardId)
  if (!dashboardData) {
    throw new Error('Dashboard not found')
  }

  const dashboardContext = buildDashboardContext({
    sessionId: session.sessionId,
    userId: session.userId,
    dashboard: dashboardData.dashboard,
    components: dashboardData.components,
  })

  const assistantObjectId = new mongoose.Types.ObjectId()
  const assistantId = assistantObjectId.toString()
  const room = sessionRoom(session.sessionId)
  const existingState = getSessionState(session.sessionId)
  const abortController = new AbortController()
  registerSessionRun(session.sessionId, abortController)

  let accumulated = ''
  let lastEmitAt = 0
  const EMIT_INTERVAL_MS = 32
  const MAX_ACCUMULATED_CHARS = 512_000
  let turnCompleted = false

  const emitStream = (done: boolean) => {
    io.to(room).emit(AGENT_EVENTS.MESSAGE_STREAM, {
      sessionId: session.sessionId,
      messageId: assistantId,
      chunk: accumulated,
      done,
    })
  }

  try {
    const { state, finishReason } = await biAgentLoop(
      userContent,
      {
        modelManager,
        dashboardContext,
        executorChannel: DEFAULT_WS_EXECUTOR_CHANNEL,
        abortSignal: abortController.signal,
      },
      {
        onTextDelta: (delta) => {
          if (accumulated.length >= MAX_ACCUMULATED_CHARS) return
          const remaining = MAX_ACCUMULATED_CHARS - accumulated.length
          accumulated += delta.length > remaining ? delta.slice(0, remaining) : delta
          const now = Date.now()
          if (now - lastEmitAt >= EMIT_INTERVAL_MS) {
            lastEmitAt = now
            emitStream(false)
          }
        },
        onToolCall: (toolCallId, toolName) => {
          console.log('[agent-runtime] tool call:', toolCallId, toolName)
        },
        onToolProgress: (toolCallId, message) => {
          console.log('[agent-runtime] tool progress:', toolCallId, message)
        },
        onToolResult: (toolCallId, result, isError) => {
          console.log('[agent-runtime] tool result:', toolCallId, isError ? 'error' : 'ok', result.slice(0, 200))
        },
        onUsageUpdate: () => {},
        onError: (error) => {
          console.error('[agent-runtime] loop error:', error.message)
        },
      },
      existingState,
    )

    setSessionState(session.sessionId, state)
    emitStream(true)

    const finalContent = truncateMessageContent(
      accumulated ||
        (finishReason === 'aborted'
          ? '(已取消)'
          : finishReason === 'error'
            ? '(生成失败，请重试)'
            : '(empty response)'),
    )

    await AgentMessageModel.create({
      _id: assistantObjectId,
      sessionId: session.sessionId,
      role: 'assistant',
      content: finalContent,
    })
    await AgentSessionModel.updateOne({ sessionId: session.sessionId }, { updatedAt: new Date() })

    const saved = await AgentMessageModel.findById(assistantObjectId)
    if (saved) {
      io.to(room).emit(AGENT_EVENTS.MESSAGE_COMPLETE, toMessageDto(saved))
    }
    turnCompleted = true
  } catch (error) {
    if (accumulated) {
      await AgentMessageModel.create({
        _id: assistantObjectId,
        sessionId: session.sessionId,
        role: 'assistant',
        content: truncateMessageContent(accumulated),
      })
      const saved = await AgentMessageModel.findById(assistantObjectId)
      if (saved) {
        io.to(room).emit(AGENT_EVENTS.MESSAGE_COMPLETE, toMessageDto(saved))
        turnCompleted = true
      }
    }

    const message = error instanceof Error ? error.message : 'Agent run failed'
    io.to(room).emit(AGENT_EVENTS.ERROR, { code: 'AGENT_RUN_FAILED', message })
    throw error
  } finally {
    emitStream(true)
    if (!turnCompleted) {
      io.to(room).emit(AGENT_EVENTS.ERROR, {
        code: 'AGENT_RUN_FAILED',
        message: 'Agent run ended unexpectedly',
      })
    }
    unregisterSessionRun(session.sessionId, abortController)
  }
}

export function clearAgentSessionState(sessionId: string): void {
  clearSessionState(sessionId)
}
