import { FastifyInstance } from 'fastify'

import {
  archiveAgentSession,
  createAgentSession,
  getAgentSession,
  listAgentMessages,
  listAgentSessions,
  updateAgentSessionTitle,
} from '../../services/agent.service'

export default async function (fastify: FastifyInstance) {
  fastify.register(
    async (app) => {
      app.post<{ Body: { dashboardId?: string; sessionTitle?: string } }>(
        '/sessions',
        async (request, reply) => {
          const { dashboardId, sessionTitle } = request.body ?? {}

          if (!dashboardId) {
            return reply.status(400).send({ ok: false, message: 'dashboardId is required' })
          }

          try {
            const session = await createAgentSession(dashboardId, sessionTitle ?? '新会话')
            return reply.status(201).send({ ok: true, data: session })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create session'
            return reply.status(400).send({ ok: false, message })
          }
        },
      )

      app.get<{ Querystring: { dashboardId?: string; status?: 'active' | 'archived' } }>(
        '/sessions',
        async (request, reply) => {
          const { dashboardId, status = 'active' } = request.query

          if (!dashboardId) {
            return reply.status(400).send({ ok: false, message: 'dashboardId is required' })
          }

          try {
            const sessions = await listAgentSessions(dashboardId, status)
            return reply.send({ ok: true, data: sessions })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to list sessions'
            return reply.status(400).send({ ok: false, message })
          }
        },
      )

      app.get<{ Params: { sessionId: string } }>('/sessions/:sessionId', async (request, reply) => {
        try {
          const session = await getAgentSession(request.params.sessionId)

          if (!session) {
            return reply.status(404).send({ ok: false, message: 'Session not found' })
          }

          return reply.send({ ok: true, data: session })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to get session'
          return reply.status(400).send({ ok: false, message })
        }
      })

      app.get<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/messages',
        async (request, reply) => {
          try {
            const session = await getAgentSession(request.params.sessionId)

            if (!session) {
              return reply.status(404).send({ ok: false, message: 'Session not found' })
            }

            const messages = await listAgentMessages(request.params.sessionId)
            return reply.send({ ok: true, data: messages })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load messages'
            return reply.status(400).send({ ok: false, message })
          }
        },
      )

      app.patch<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/archive',
        async (request, reply) => {
          try {
            const session = await archiveAgentSession(request.params.sessionId)

            if (!session) {
              return reply.status(404).send({ ok: false, message: 'Session not found' })
            }

            return reply.send({ ok: true, data: session })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to archive session'
            return reply.status(400).send({ ok: false, message })
          }
        },
      )

      app.patch<{ Params: { sessionId: string }; Body: { sessionTitle?: string } }>(
        '/sessions/:sessionId',
        async (request, reply) => {
          const sessionTitle = request.body?.sessionTitle

          if (!sessionTitle?.trim()) {
            return reply.status(400).send({ ok: false, message: 'sessionTitle is required' })
          }

          try {
            const session = await updateAgentSessionTitle(request.params.sessionId, sessionTitle)

            if (!session) {
              return reply.status(404).send({ ok: false, message: 'Session not found' })
            }

            return reply.send({ ok: true, data: session })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to rename session'
            return reply.status(400).send({ ok: false, message })
          }
        },
      )
    },
    { prefix: '/api/bi-agent' },
  )
}
