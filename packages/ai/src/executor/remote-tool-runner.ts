import { randomUUID } from 'node:crypto'

import type { IRemoteToolExecutor } from './remote-tool-executor.interface'
import type { RemoteToolAck } from '../ws/types'

export interface CreateRemoteToolRunnerOptions {
  executor: IRemoteToolExecutor
  sessionId: string
  dashboardId: string
  defaultTimeoutMs?: number
}

/** Factory that binds session context to each remote tool invocation. */
export function createRemoteToolRunner(options: CreateRemoteToolRunnerOptions) {
  const { executor, sessionId, dashboardId, defaultTimeoutMs = 30_000 } = options

  return async function runRemoteTool(
    toolName: string,
    input: Record<string, unknown>,
    signal?: AbortSignal,
    timeoutMs = defaultTimeoutMs,
  ): Promise<RemoteToolAck> {
    const requestId = randomUUID()

    return executor.execute(
      {
        requestId,
        sessionId,
        dashboardId,
        toolName,
        input,
        timeoutMs,
      },
      signal,
    )
  }
}
