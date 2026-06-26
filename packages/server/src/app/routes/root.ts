import { FastifyInstance } from 'fastify'

import { isMongoConnected } from '../../db/connection'

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: 'BlocksBI Server', status: 'ok' }
  })

  fastify.get('/health', async function () {
    const health: { status: string; mongo?: string } = { status: 'ok' }

    if (isMongoConnected()) {
      health.mongo = 'connected'
    }

    return health
  })
}
