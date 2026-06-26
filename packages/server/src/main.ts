import Fastify from 'fastify'
import { app } from './app/app'
import { setupSocketIO } from './socket'

const host = process.env.HOST ?? 'localhost'
const port = process.env.PORT ? Number(process.env.PORT) : 3001

async function start() {
  const server = Fastify({ logger: true })

  await server.register(app)
  await server.ready()

  setupSocketIO(server.server)

  try {
    await server.listen({ port, host })
    console.log(`[ ready ] http://${host}:${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
