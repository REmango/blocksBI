import type { IWsToolTransport } from '../ws/transport.interface'
import type { RemoteToolAck, RemoteToolRequest } from '../ws/types'
import { DEFAULT_WS_EXECUTOR_CHANNEL } from '../ws/events'
import type { IRemoteToolExecutor } from './remote-tool-executor.interface'

/**
 * Adapter: inject application-layer IWsToolTransport into the agent kernel.
 * Does not depend on Socket.IO — only on the transport interface.
 */
export class BiWsToolExecutor implements IRemoteToolExecutor {
  readonly channel: string

  constructor(
    private readonly transport: IWsToolTransport,
    channel = DEFAULT_WS_EXECUTOR_CHANNEL,
  ) {
    this.channel = channel
  }

  execute(request: RemoteToolRequest, signal?: AbortSignal): Promise<RemoteToolAck> {
    return this.transport.invokeTool(request, signal)
  }

  /** Delegate ACK routing — call from WS event handler. */
  handleToolAck(ack: RemoteToolAck): boolean {
    return this.transport.handleToolAck(ack)
  }

  /** Cancel pending calls when session disconnects. */
  cancelSession(sessionId: string, reason?: string): number {
    return this.transport.cancelSession?.(sessionId, reason) ?? 0
  }
}
