import type { BiToolDefinition } from './types'

export interface ToolHookContext {
  sessionId: string
  dashboardId: string
  toolName: string
  input: Record<string, unknown>
  toolCallId: string
}

export interface ToolHookResult {
  proceed: boolean
  reason?: string
  correctedInput?: Record<string, unknown>
}

export type ToolPreHook = (ctx: ToolHookContext) => Promise<ToolHookResult> | ToolHookResult
export type ToolPostHook = (
  ctx: ToolHookContext & { result: string; isError: boolean; durationMs: number },
) => Promise<void> | void

/** Permission interceptor — checks tool allow/deny lists. */
export function createPermissionHook(
  allowList?: string[],
  denyList?: string[],
): ToolPreHook {
  return ({ toolName }) => {
    if (denyList?.includes(toolName)) {
      return { proceed: false, reason: `Tool "${toolName}" is denied for this session.` }
    }
    if (allowList && allowList.length > 0 && !allowList.includes(toolName)) {
      return { proceed: false, reason: `Tool "${toolName}" is not in the allow list.` }
    }
    return { proceed: true }
  }
}

/** Audit log hook — records every tool invocation. */
export function createAuditHook(
  onLog: (entry: {
    toolName: string
    input: Record<string, unknown>
    result: string
    isError: boolean
    durationMs: number
  }) => void,
): ToolPostHook {
  return ({ toolName, input, result, isError, durationMs }) => {
    onLog({ toolName, input, result, isError, durationMs })
  }
}

export class ToolHookRunner {
  constructor(
    private readonly preHooks: ToolPreHook[] = [],
    private readonly postHooks: ToolPostHook[] = [],
  ) {}

  async runPreHooks(ctx: ToolHookContext): Promise<ToolHookResult> {
    let input = ctx.input
    for (const hook of this.preHooks) {
      const result = await hook({ ...ctx, input })
      if (!result.proceed) return result
      if (result.correctedInput) input = result.correctedInput
    }
    return { proceed: true, correctedInput: input }
  }

  async runPostHooks(
    ctx: ToolHookContext & { result: string; isError: boolean; durationMs: number },
  ): Promise<void> {
    for (const hook of this.postHooks) {
      await hook(ctx)
    }
  }
}

export function getToolDefinition(
  registry: Record<string, BiToolDefinition>,
  toolName: string,
): BiToolDefinition | undefined {
  return registry[toolName]
}
