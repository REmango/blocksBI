import type { IRemoteToolExecutor } from '../executor/remote-tool-executor.interface'
import { ToolRegistry } from './tool-registry'

export function resolveRemoteExecutor(options: {
  remoteExecutor?: IRemoteToolExecutor
  executorChannel?: string
}): IRemoteToolExecutor {
  if (options.remoteExecutor) {
    return options.remoteExecutor
  }
  if (ToolRegistry.hasExecutor(options.executorChannel)) {
    return ToolRegistry.getExecutor(options.executorChannel)
  }
  throw new Error(
    'No remote tool executor configured. Pass BiAgentOptions.remoteExecutor or ' +
      'register one via ToolRegistry.registerExecutor() at startup.',
  )
}
