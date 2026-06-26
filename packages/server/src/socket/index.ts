import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'

import { initAgentRuntime } from '../agent/agent-runtime'
import { getAdminUserId } from '../constants/admin'
import { registerAgentHandlers } from './agent.handler'
import { AGENT_EVENTS, BI_AGENT_NAMESPACE } from './events'

/** Engine-level heartbeat: ping every 4s, disconnect if no pong within 12s. */
const HEARTBEAT_INTERVAL_MS = 4_000
const HEARTBEAT_TIMEOUT_MS = 12_000

export function setupSocketIO(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
      methods: ['GET', 'POST'],
    },
    pingInterval: HEARTBEAT_INTERVAL_MS,
    pingTimeout: HEARTBEAT_TIMEOUT_MS,
  })

  io.on('connection', (socket) => {
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() })
    })
  })

  const biAgentIo = io.of(BI_AGENT_NAMESPACE)
  initAgentRuntime(biAgentIo)

  biAgentIo.on('connection', async (socket) => {
    console.log('[socket:/bi-agent] client connected:', socket.id)

    try {
      const adminUserId = await getAdminUserId()
      registerAgentHandlers(biAgentIo, socket, adminUserId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize agent socket'
      console.error('[socket:/bi-agent] init error:', message)
      socket.emit(AGENT_EVENTS.ERROR, { code: 'INIT_FAILED', message })
      socket.disconnect(true)
    }

    socket.on('disconnect', () => {
      console.log('[socket:/bi-agent] client disconnected:', socket.id)
    })
  })

  console.log(
    '[socket] namespace registered:',
    BI_AGENT_NAMESPACE,
    `(heartbeat: ping ${HEARTBEAT_INTERVAL_MS}ms, timeout ${HEARTBEAT_TIMEOUT_MS}ms)`,
  )

  return io
}
