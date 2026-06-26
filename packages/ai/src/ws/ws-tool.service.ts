import type { IWsToolTransport } from './transport.interface'
import { WS_TOOL_EVENTS } from './events'
import { PendingRequestRegistry } from './pending-requests'
import type { RemoteToolAck, RemoteToolProgress, RemoteToolRequest } from './types'

/** Minimal emit surface — compatible with Socket.IO Namespace / Server. */
export interface WsEmitter {
  to(room: string): { emit(event: string, payload: unknown): void }
}

export interface WsToolServiceOptions {
  /** Build session room name from sessionId. Default: `session:${sessionId}` */
  sessionRoom?: (sessionId: string) => string
  /** Shared pending registry — create one per server process. */
  pendingRegistry?: PendingRequestRegistry
  /** Progress handler forwarded to agent callbacks. */
  onProgress?: (progress: RemoteToolProgress) => void
}

/**
 * Reference WS tool service for Socket.IO — application layer binds this
 * to the concrete io server and registers ACK listeners at startup.
 *
 * @example
 * ```ts
 * const pending = new PendingRequestRegistry()
 * const wsToolService = new WsToolService(io.of('/bi-agent'), { pendingRegistry: pending })
 * wsToolService.bindAckListener(socketServer)
 * const executor = new BiWsToolExecutor(wsToolService)
 * ToolRegistry.registerExecutor('bi_ws', executor)
 * ```
 */
export class WsToolService implements IWsToolTransport {
  readonly pending: PendingRequestRegistry
  private readonly sessionRoom: (sessionId: string) => string
  private readonly onProgress?: (progress: RemoteToolProgress) => void

  constructor(
    private readonly emitter: WsEmitter,
    options: WsToolServiceOptions = {},
  ) {
    this.pending = options.pendingRegistry ?? new PendingRequestRegistry()
    this.sessionRoom = options.sessionRoom ?? ((sessionId) => `session:${sessionId}`)
    this.onProgress = options.onProgress
  }

  async invokeTool(request: RemoteToolRequest, signal?: AbortSignal): Promise<RemoteToolAck> {
    if (signal?.aborted) {
      return { requestId: request.requestId, ok: false, error: 'Aborted' }
    }

    const execPromise = this.pending.register(
      {
        requestId: request.requestId,
        sessionId: request.sessionId,
        toolName: request.toolName,
        createdAt: Date.now(),
      },
      request.timeoutMs,
    )

    this.emitter.to(this.sessionRoom(request.sessionId)).emit(WS_TOOL_EVENTS.TOOL_EXECUTE, request)
    console.log(
      '[ws-tool] execute →',
      request.sessionId,
      request.dashboardId,
      request.toolName,
      request.requestId,
    )

    if (!signal) {
      return execPromise
    }

    const abortPromise = new Promise<RemoteToolAck>((resolve) => {
      const onAbort = () => {
        signal.removeEventListener('abort', onAbort)
        this.pending.reject(request.requestId, new Error('Aborted'))
        resolve({ requestId: request.requestId, ok: false, error: 'Aborted' })
      }
      signal.addEventListener('abort', onAbort)
    })

    return Promise.race([execPromise, abortPromise])
  }

  handleToolAck(ack: RemoteToolAck): boolean {
    const resolved = this.pending.resolve(ack.requestId, ack)
    if (resolved) {
      console.log('[ws-tool] ack ←', ack.requestId, ack.ok ? 'ok' : ack.error)
    }
    return resolved
  }

  handleToolProgress(progress: RemoteToolProgress): boolean {
    this.onProgress?.(progress)
    return true
  }

  cancelSession(sessionId: string, reason?: string): number {
    return this.pending.cancelSession(sessionId, reason)
  }

  /**
   * Wire frontend ACK / progress events on a connected Socket.IO socket.
   * Call once per client connection — custom events are not delivered via namespace.on().
   */
  bindSocketListeners(socket: {
    on(event: string, listener: (...args: unknown[]) => void): void
  }): void {
    socket.on(WS_TOOL_EVENTS.TOOL_ACK, (payload: unknown, ack?: (response: unknown) => void) => {
      const remoteAck = payload as RemoteToolAck
      if (remoteAck?.requestId) {
        this.handleToolAck(remoteAck)
      }
      ack?.({ ok: true })
    })

    socket.on(
      WS_TOOL_EVENTS.TOOL_PROGRESS,
      (payload: unknown, ack?: (response: unknown) => void) => {
        const progress = payload as RemoteToolProgress
        if (progress?.requestId) {
          this.handleToolProgress(progress)
        }
        ack?.({ ok: true })
      },
    )
  }

  /**
   * @deprecated Use bindSocketListeners() per connection. namespace.on() does not receive client events.
   */
  bindNamespaceListeners(namespace: {
    on(event: string, listener: (payload: unknown) => void): void
  }): void {
    namespace.on('connection', (socket: { on(event: string, listener: (payload: unknown) => void): void }) => {
      this.bindSocketListeners(socket)
    })
  }
}
