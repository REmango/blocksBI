/// <reference lib="webworker" />

import { io, type Socket } from 'socket.io-client'

import {
  DEFAULT_WS_URL,
  SERVER_PUSH_EVENTS,
  WS_BROADCAST_CHANNEL,
} from './constants'
import { reconnectRateLimiter } from './reconnect-policy'
import type {
  BroadcastMessage,
  ConnectPayload,
  ConnectionStatus,
  EmitPayload,
  WorkerCommand,
  WorkerReply,
} from './protocol'

declare const self: SharedWorkerGlobalScope

const broadcast = new BroadcastChannel(WS_BROADCAST_CHANNEL)

let socket: Socket | null = null
let currentUrl = DEFAULT_WS_URL
let currentNamespace: string | undefined
let connectPromise: Promise<ConnectionStatus> | null = null
let connectTargetKey: string | null = null
let dashboardConsumerCount = 0
let networkOnline = true

function connectTargetKeyFor(url: string, namespace?: string): string {
  return `${url}|${namespace ?? ''}`
}

function buildSocketUrl(baseUrl: string, namespace?: string): string {
  const normalized = baseUrl.replace(/\/$/, '')
  if (!namespace) return normalized
  const ns = namespace.startsWith('/') ? namespace : `/${namespace}`
  return `${normalized}${ns}`
}

function getStatus(): ConnectionStatus {
  return {
    connected: socket?.connected ?? false,
    socketId: socket?.id,
    url: currentUrl,
    namespace: currentNamespace,
  }
}

function postBroadcast(message: Omit<BroadcastMessage, 'timestamp'>): void {
  broadcast.postMessage({
    ...message,
    timestamp: Date.now(),
  } satisfies BroadcastMessage)
}

function reply(port: MessagePort, message: WorkerReply): void {
  port.postMessage(message)
}

function replyError(port: MessagePort, requestId: string, message: string, code = 'WORKER_ERROR'): void {
  reply(port, {
    type: 'error',
    requestId,
    error: { code, message },
  })
}

function teardownSocket(): void {
  if (!socket) return
  socket.io.off('reconnect_attempt')
  socket.removeAllListeners()
  socket.disconnect()
  socket = null
  connectPromise = null
  connectTargetKey = null
}

function disableAutoReconnect(activeSocket: Socket): void {
  if (activeSocket.io.opts) {
    activeSocket.io.opts.reconnection = false
  }
}

function enableAutoReconnect(activeSocket: Socket): void {
  if (activeSocket.io.opts) {
    activeSocket.io.opts.reconnection = true
  }
}

function attachSocketListeners(activeSocket: Socket): void {
  activeSocket.on('connect', () => {
    postBroadcast({
      type: 'connection',
      event: 'connect',
      payload: getStatus(),
    })
  })

  activeSocket.on('disconnect', (reason) => {
    postBroadcast({
      type: 'connection',
      event: 'disconnect',
      payload: { reason, ...getStatus() },
    })
  })

  activeSocket.io.on('reconnect_attempt', () => {
    if (!networkOnline || !reconnectRateLimiter.canAttempt()) {
      disableAutoReconnect(activeSocket)
      activeSocket.disconnect()
      postBroadcast({
        type: 'connection',
        event: 'reconnect-blocked',
        payload: { reason: 'rate-limited-or-offline', ...getStatus() },
      })
    }
  })

  activeSocket.onAny((event, payload) => {
    if (!SERVER_PUSH_EVENTS.has(event)) return

    if (event === 'agent:tool:execute') {
      console.log('[shared-worker] server push:', event, payload)
    }

    postBroadcast({
      type: 'server-event',
      event,
      payload,
    })
  })
}

function canConnectNow(): boolean {
  if (!networkOnline || dashboardConsumerCount <= 0) {
    return false
  }
  return !reconnectRateLimiter.isFrozen()
}

function connectSocket(url: string, namespace?: string): Promise<ConnectionStatus> {
  const targetKey = connectTargetKeyFor(url, namespace)

  if (dashboardConsumerCount <= 0) {
    return Promise.resolve(getStatus())
  }

  if (!networkOnline) {
    return Promise.reject(new Error('Network offline — connection paused'))
  }

  if (reconnectRateLimiter.isFrozen()) {
    return Promise.reject(new Error('Reconnect rate limit exceeded — try again later'))
  }

  if (socket?.connected && currentUrl === url && currentNamespace === namespace) {
    return Promise.resolve(getStatus())
  }

  if (connectPromise && connectTargetKey === targetKey) {
    return connectPromise
  }

  if (!reconnectRateLimiter.canAttempt()) {
    return Promise.reject(new Error('Reconnect rate limit exceeded — try again later'))
  }

  connectTargetKey = targetKey
  connectPromise = startConnect(url, namespace).finally(() => {
    connectPromise = null
    connectTargetKey = null
  })

  return connectPromise
}

function startConnect(url: string, namespace?: string): Promise<ConnectionStatus> {
  teardownSocket()
  currentUrl = url
  currentNamespace = namespace

  const socketUrl = buildSocketUrl(url, namespace)

  return new Promise((resolve, reject) => {
    const nextSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20_000,
    })

    socket = nextSocket
    attachSocketListeners(nextSocket)

    const connectTimeout = setTimeout(() => {
      cleanup()
      teardownSocket()
      reject(new Error(`Socket connect timeout: ${socketUrl}`))
    }, 20_000)

    const onConnect = () => {
      cleanup()
      resolve(getStatus())
    }

    const onError = (error: Error) => {
      cleanup()
      teardownSocket()
      reject(error)
    }

    const cleanup = () => {
      clearTimeout(connectTimeout)
      nextSocket.off('connect', onConnect)
      nextSocket.off('connect_error', onError)
    }

    nextSocket.once('connect', onConnect)
    nextSocket.once('connect_error', onError)
  })
}

function setNetworkOnline(online: boolean): void {
  networkOnline = online

  if (!online) {
    if (socket) {
      disableAutoReconnect(socket)
      socket.disconnect()
    }
    return
  }

  reconnectRateLimiter.reset()

  if (dashboardConsumerCount > 0 && !socket?.connected && currentUrl) {
    void connectSocket(currentUrl, currentNamespace).catch(() => undefined)
  } else if (socket) {
    enableAutoReconnect(socket)
  }
}

function acquireDashboard(): { dashboardConsumers: number } {
  dashboardConsumerCount += 1
  return { dashboardConsumers: dashboardConsumerCount }
}

function releaseDashboard(): { dashboardConsumers: number } {
  dashboardConsumerCount = Math.max(0, dashboardConsumerCount - 1)

  if (dashboardConsumerCount === 0) {
    teardownSocket()
    reconnectRateLimiter.reset()
  }

  return { dashboardConsumers: dashboardConsumerCount }
}

/** Events emitted to server that do not expect a Socket.IO ack callback. */
const FIRE_AND_FORGET_EMIT_EVENTS = new Set<string>([
  'agent:tool:ack',
  'agent:tool:progress',
])

async function handleCommand(port: MessagePort, command: WorkerCommand): Promise<void> {
  const { type, requestId, payload } = command

  try {
    switch (type) {
      case 'acquire-dashboard': {
        const result = acquireDashboard()
        reply(port, { type: 'status', requestId, payload: result })
        break
      }

      case 'release-dashboard': {
        const result = releaseDashboard()
        reply(port, { type: 'disconnected', requestId, payload: { ...getStatus(), ...result } })
        break
      }

      case 'set-network-online': {
        const { online } = (payload ?? {}) as { online?: boolean }
        setNetworkOnline(online ?? true)
        reply(port, { type: 'status', requestId, payload: getStatus() })
        break
      }

      case 'connect': {
        if (!canConnectNow()) {
          replyError(
            port,
            requestId,
            networkOnline ? 'No dashboard consumer or reconnect limited' : 'Network offline',
            'NOT_CONNECTED',
          )
          return
        }

        const { url = DEFAULT_WS_URL, namespace } = (payload ?? {}) as ConnectPayload
        const status = await connectSocket(url, namespace)
        reply(port, { type: 'connected', requestId, payload: status })
        break
      }

      case 'disconnect': {
        teardownSocket()
        reconnectRateLimiter.reset()
        reply(port, { type: 'disconnected', requestId, payload: getStatus() })
        break
      }

      case 'get-status': {
        reply(port, { type: 'status', requestId, payload: getStatus() })
        break
      }

      case 'ping': {
        if (socket?.connected) {
          socket.emit('ping')
        }
        reply(port, { type: 'pong', requestId, payload: { timestamp: Date.now() } })
        break
      }

      case 'emit': {
        const { event, data } = (payload ?? {}) as EmitPayload

        if (!event) {
          replyError(port, requestId, 'Event name is required', 'INVALID_EVENT')
          return
        }

        if (!socket?.connected) {
          replyError(port, requestId, 'Socket is not connected', 'NOT_CONNECTED')
          return
        }

        if (FIRE_AND_FORGET_EMIT_EVENTS.has(event)) {
          socket.emit(event, data)
          reply(port, { type: 'ack', requestId, payload: { ok: true } })
          break
        }

        socket.emit(event, data, (response: unknown) => {
          reply(port, { type: 'ack', requestId, payload: response })
        })
        break
      }

      default:
        replyError(port, requestId, `Unknown command: ${type}`, 'UNKNOWN_COMMAND')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Worker command failed'
    replyError(port, requestId, message)
  }
}

self.onconnect = (event: MessageEvent) => {
  const port = event.ports[0]
  port.start()

  port.onmessage = (messageEvent: MessageEvent<WorkerCommand>) => {
    void handleCommand(port, messageEvent.data)
  }

  port.postMessage({
    type: 'status',
    requestId: 'init',
    payload: getStatus(),
  } satisfies WorkerReply)
}

export {}
