import { WS_BROADCAST_CHANNEL, WS_SHARED_WORKER_NAME } from './constants'
import { resetBiAgentJoinState } from './join-state'
import type {
  AckResponse,
  AgentEventHandler,
  BroadcastMessage,
  ConnectPayload,
  ConnectionStatus,
  EmitPayload,
  WorkerCommand,
  WorkerReply,
} from './protocol'

type Unsubscribe = () => void

function createRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function isSharedWorkerSupported(): boolean {
  return typeof SharedWorker !== 'undefined'
}

/**
 * BlocksBI WebSocket client (tab side).
 * Single SharedWorker holds the Socket.IO instance; tabs share via MessagePort + BroadcastChannel.
 */
export class BlocksBiWsClient {
  private worker: SharedWorker | null = null
  private port: MessagePort | null = null
  private broadcast: BroadcastChannel | null = null
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: unknown) => void
      reject: (reason: Error) => void
      timer: ReturnType<typeof setTimeout>
    }
  >()
  private eventHandlers = new Map<string, Set<AgentEventHandler>>()
  private connectionHandlers = new Set<AgentEventHandler<ConnectionStatus>>()
  private destroyed = false
  private disconnectListenerRegistered = false
  private readonly requestTimeoutMs: number
  private readonly connectTimeoutMs: number
  private connectPromise: Promise<ConnectionStatus> | null = null

  constructor(options?: { requestTimeoutMs?: number; connectTimeoutMs?: number }) {
    this.requestTimeoutMs = options?.requestTimeoutMs ?? 30_000
    this.connectTimeoutMs = options?.connectTimeoutMs ?? 60_000
  }

  init(): void {
    if (this.destroyed) {
      throw new Error('WsClient has been destroyed')
    }

    if (this.worker) return

    if (!isSharedWorkerSupported()) {
      throw new Error('SharedWorker is not supported in this browser')
    }

    this.worker = new SharedWorker(new URL('./shared-worker.ts', import.meta.url), {
      type: 'module',
      name: WS_SHARED_WORKER_NAME,
    })

    this.port = this.worker.port
    this.port.start()
    this.port.onmessage = (event: MessageEvent<WorkerReply>) => {
      this.handleWorkerReply(event.data)
    }

    this.broadcast = new BroadcastChannel(WS_BROADCAST_CHANNEL)
    this.broadcast.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      this.handleBroadcastMessage(event.data)
    }

    this.ensureDisconnectJoinResetListener()
  }

  async connect(options?: ConnectPayload): Promise<ConnectionStatus> {
    this.init()
    if (this.connectPromise) {
      return this.connectPromise
    }

    this.connectPromise = this.sendCommand<ConnectionStatus>(
      'connect',
      options,
      this.connectTimeoutMs,
    ).finally(() => {
      this.connectPromise = null
    })

    return this.connectPromise
  }

  async disconnect(): Promise<ConnectionStatus> {
    return this.sendCommand<ConnectionStatus>('disconnect')
  }

  async acquireDashboard(): Promise<{ dashboardConsumers: number }> {
    this.init()
    return this.sendCommand<{ dashboardConsumers: number }>('acquire-dashboard')
  }

  async releaseDashboard(): Promise<{ dashboardConsumers: number }> {
    this.init()
    return this.sendCommand<{ dashboardConsumers: number }>('release-dashboard')
  }

  async setNetworkOnline(online: boolean): Promise<void> {
    this.init()
    await this.sendCommand('set-network-online', { online })
  }

  async getStatus(): Promise<ConnectionStatus> {
    this.init()
    return this.sendCommand<ConnectionStatus>('get-status')
  }

  async ping(): Promise<{ timestamp: number }> {
    return this.sendCommand<{ timestamp: number }>('ping')
  }

  async emit<TResponse = unknown>(event: string, data?: unknown): Promise<TResponse> {
    return this.sendCommand<TResponse>('emit', { event, data } satisfies EmitPayload)
  }

  async emitAgent<TPayload, TData = unknown>(
    event: string,
    payload: TPayload,
  ): Promise<AckResponse<TData>> {
    return this.emit<AckResponse<TData>>(event, payload)
  }

  on<T = unknown>(event: string, handler: AgentEventHandler<T>): Unsubscribe {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }

    const handlers = this.eventHandlers.get(event)!
    handlers.add(handler as AgentEventHandler)

    return () => {
      handlers.delete(handler as AgentEventHandler)
      if (handlers.size === 0) {
        this.eventHandlers.delete(event)
      }
    }
  }

  onConnectionChange(handler: AgentEventHandler<ConnectionStatus>): Unsubscribe {
    this.connectionHandlers.add(handler)
    return () => {
      this.connectionHandlers.delete(handler)
    }
  }

  destroy(): void {
    this.destroyed = true

    for (const pending of this.pendingRequests.values()) {
      clearTimeout(pending.timer)
      pending.reject(new Error('WsClient destroyed'))
    }
    this.pendingRequests.clear()
    this.eventHandlers.clear()
    this.connectionHandlers.clear()
    this.disconnectListenerRegistered = false

    this.port?.close()
    this.port = null

    this.broadcast?.close()
    this.broadcast = null

    this.worker = null
  }

  private ensureDisconnectJoinResetListener(): void {
    if (this.disconnectListenerRegistered) return
    this.disconnectListenerRegistered = true

    this.onConnectionChange((status) => {
      if (!status.connected) {
        resetBiAgentJoinState()
      }
    })
  }

  private sendCommand<T>(
    type: WorkerCommand['type'],
    payload?: unknown,
    timeoutMs = this.requestTimeoutMs,
  ): Promise<T> {
    if (!this.port) {
      throw new Error('WsClient is not initialized. Call init() or connect() first.')
    }

    const requestId = createRequestId()

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId)
        reject(new Error(`WsClient request timeout: ${type}`))
      }, timeoutMs)

      this.pendingRequests.set(requestId, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timer,
      })

      this.port!.postMessage({
        type,
        requestId,
        payload,
      } satisfies WorkerCommand)
    })
  }

  private handleWorkerReply(reply: WorkerReply): void {
    if (reply.requestId === 'init') {
      if (reply.type === 'status') {
        this.notifyConnectionHandlers(reply.payload as ConnectionStatus)
      }
      return
    }

    const pending = this.pendingRequests.get(reply.requestId)
    if (!pending) return

    clearTimeout(pending.timer)
    this.pendingRequests.delete(reply.requestId)

    if (reply.type === 'error' || reply.error) {
      pending.reject(new Error(reply.error?.message ?? 'Worker request failed'))
      return
    }

    if (reply.type === 'connected' || reply.type === 'disconnected' || reply.type === 'status') {
      this.notifyConnectionHandlers(reply.payload as ConnectionStatus)
    }

    pending.resolve(reply.payload)
  }

  private handleBroadcastMessage(message: BroadcastMessage): void {
    if (message.type === 'connection') {
      this.notifyConnectionHandlers(message.payload as ConnectionStatus)
      return
    }

    if (message.type === 'server-event' && message.event) {
      this.notifyEventHandlers(message.event, message.payload)
    }
  }

  private notifyConnectionHandlers(status: ConnectionStatus): void {
    for (const handler of this.connectionHandlers) {
      handler(status)
    }
  }

  private notifyEventHandlers(event: string, payload: unknown): void {
    const handlers = this.eventHandlers.get(event)
    if (!handlers) return

    for (const handler of handlers) {
      handler(payload)
    }
  }
}

let defaultClient: BlocksBiWsClient | null = null

export function getWsClient(): BlocksBiWsClient {
  if (!defaultClient) {
    defaultClient = new BlocksBiWsClient()
  }
  return defaultClient
}
