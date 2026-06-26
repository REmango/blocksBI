/**
 * @deprecated Import from `@block-bi/ai` root exports.
 * Kept for backward compatibility.
 */
export type { RemoteToolAck, RemoteToolRequest, RemoteToolProgress } from '../ws/types'
export type { IRemoteToolExecutor, RemoteToolExecutor } from './remote-tool-executor.interface'
export { BiWsToolExecutor } from './bi-ws-tool-executor'
export { createRemoteToolRunner } from './remote-tool-runner'
export type { CreateRemoteToolRunnerOptions } from './remote-tool-runner'
export { PendingRequestRegistry } from '../ws/pending-requests'
export { WsToolService } from '../ws/ws-tool.service'

/** @deprecated Use CreateRemoteToolRunnerOptions */
export type CreateRemoteExecutorOptions = import('./remote-tool-runner').CreateRemoteToolRunnerOptions
