import type { RemoteToolAck, RemoteToolRequest } from '../ws/types'

/**
 * Kernel-layer remote tool executor — adapts transport to agent loop.
 * Register implementations via ToolRegistry at application startup.
 */
export interface IRemoteToolExecutor {
  /** Channel name, e.g. `bi_ws`. */
  readonly channel: string
  execute(request: RemoteToolRequest, signal?: AbortSignal): Promise<RemoteToolAck>
}

/** @deprecated Use IRemoteToolExecutor */
export type RemoteToolExecutor = IRemoteToolExecutor
