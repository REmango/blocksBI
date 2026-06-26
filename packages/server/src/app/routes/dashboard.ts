import { FastifyInstance } from 'fastify'

import {
  createDashboard,
  getDashboard,
  listDashboards,
  saveDashboard,
  type SaveDashboardPayload,
} from '../../services/dashboard.service'
import { DASHBOARD_ID_ROUTE_PARAM } from '../../utils/dashboard-id'

export default async function (fastify: FastifyInstance) {
  fastify.register(
    async (app) => {
      app.post<{ Body: { name?: string } }>('/', async (request, reply) => {
        try {
          const result = await createDashboard(request.body?.name)
          return reply.status(201).send({ ok: true, data: result })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create dashboard'
          return reply.status(400).send({ ok: false, message })
        }
      })

      app.get('/list', async (_request, reply) => {
        try {
          const result = await listDashboards()
          return reply.send({ ok: true, data: result })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to list dashboards'
          return reply.status(400).send({ ok: false, message })
        }
      })

      app.put<{ Params: { dashboardId: string }; Body: SaveDashboardPayload }>(
        `/${DASHBOARD_ID_ROUTE_PARAM}`,
        async (request, reply) => {
          try {
            const result = await saveDashboard(request.params.dashboardId, request.body)
            return reply.send({ ok: true, data: result })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save dashboard'
            return reply.status(400).send({ ok: false, message })
          }
        },
      )

      app.get<{ Params: { dashboardId: string } }>(
        `/${DASHBOARD_ID_ROUTE_PARAM}`,
        async (request, reply) => {
          try {
            const result = await getDashboard(request.params.dashboardId)

            if (!result) {
              return reply.status(404).send({ ok: false, message: 'Dashboard not found' })
            }

            return reply.send({ ok: true, data: result })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get dashboard'
            return reply.status(400).send({ ok: false, message })
          }
        },
      )
    },
    { prefix: '/api/dashboards' },
  )
}
