import type { IRemoteToolExecutor } from '../executor/remote-tool-executor.interface'
import { DEFAULT_WS_EXECUTOR_CHANNEL } from '../ws/events'

/**
 * Kernel tool executor registry — application layer registers concrete
 * WS implementations at startup via dependency injection.
 *
 * @example
 * ```ts
 * const wsToolService = new WsToolService(io.of('/bi-agent'))
 * const biExecutor = new BiWsToolExecutor(wsToolService)
 * ToolRegistry.registerExecutor('bi_ws', biExecutor)
 * ```
 */
export class ToolRegistry {
  private static executors = new Map<string, IRemoteToolExecutor>()
  private static defaultChannel = DEFAULT_WS_EXECUTOR_CHANNEL

  static registerExecutor(channel: string, executor: IRemoteToolExecutor): void {
    ToolRegistry.executors.set(channel, executor)
  }

  static unregisterExecutor(channel: string): boolean {
    return ToolRegistry.executors.delete(channel)
  }

  static getExecutor(channel?: string): IRemoteToolExecutor {
    const key = channel ?? ToolRegistry.defaultChannel
    const executor = ToolRegistry.executors.get(key)
    if (!executor) {
      throw new Error(
        `No remote tool executor registered for channel "${key}". ` +
          'Call ToolRegistry.registerExecutor() at application startup.',
      )
    }
    return executor
  }

  static hasExecutor(channel?: string): boolean {
    const key = channel ?? ToolRegistry.defaultChannel
    return ToolRegistry.executors.has(key)
  }

  static setDefaultChannel(channel: string): void {
    ToolRegistry.defaultChannel = channel
  }

  static getDefaultChannel(): string {
    return ToolRegistry.defaultChannel
  }

  static listChannels(): string[] {
    return [...ToolRegistry.executors.keys()]
  }

  static clear(): void {
    ToolRegistry.executors.clear()
    ToolRegistry.defaultChannel = DEFAULT_WS_EXECUTOR_CHANNEL
  }
}

/** Instance wrapper for DI containers that prefer instance over static API. */
export class ToolRegistryInstance {
  registerExecutor(channel: string, executor: IRemoteToolExecutor): void {
    ToolRegistry.registerExecutor(channel, executor)
  }

  getExecutor(channel?: string): IRemoteToolExecutor {
    return ToolRegistry.getExecutor(channel)
  }

  hasExecutor(channel?: string): boolean {
    return ToolRegistry.hasExecutor(channel)
  }
}

export const toolRegistry = new ToolRegistryInstance()
