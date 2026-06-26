import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

import { connectMongo, disconnectMongo, getMongoUrl, isMongoConnected } from '../../db/connection'

declare module 'fastify' {
  interface FastifyInstance {
    mongoose: {
      isConnected: () => boolean
    }
  }
}

export default fp(
  async function (fastify: FastifyInstance) {
    const url = getMongoUrl()
    await connectMongo(url)

    fastify.decorate('mongoose', {
      isConnected: isMongoConnected,
    })

    fastify.addHook('onClose', async () => {
      await disconnectMongo()
    })

    fastify.log.info(`Mongoose connected: ${url.replace(/\/\/.*@/, '//***@')}`)
  },
  { name: 'mongoose' },
)
