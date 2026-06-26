import type { RemoteToolAck, RemoteToolProgress, RemoteToolRequest } from './types'

/**
 * Transport layer abstraction — implemented by the application WS service.
 * Kernel depends on this interface, not on Socket.IO or any concrete library.
 */
export interface IWsToolTransport {
  /**
   * Dispatch a tool call to the frontend session and wait for ACK.
   * Implementation should emit to the session room and register a pending promise.
   */
  invokeTool(request: RemoteToolRequest, signal?: AbortSignal): Promise<RemoteToolAck>

  /**
   * Route an ACK from the frontend back to the pending promise.
   * Returns true if a matching pending request was found.
   */
  handleToolAck(ack: RemoteToolAck): boolean

  /**
   * Optional progress callback routing (frontend → server → agent UI).
   */
  handleToolProgress?(progress: RemoteToolProgress): boolean

  /**
   * Cancel all pending tool calls for a session (e.g. on disconnect).
   */
  cancelSession?(sessionId: string, reason?: string): number
}
