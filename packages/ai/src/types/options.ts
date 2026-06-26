import type { LanguageModel } from 'ai'

import type { BiDashboardContext } from './bi-context'
import type { IRemoteToolExecutor } from '../executor/remote-tool-executor.interface'
import type { BiModelManager } from '../providers/model-manager'

export interface BiAgentOptions {
  /**
   * Unified model manager — preferred. Supports runtime switching via
   * `modelManager.switchModel()` between agent loop invocations.
   */
  modelManager?: BiModelManager
  /** Explicit model id — used when modelManager is absent. */
  modelId?: string
  /** Explicit LanguageModel — used when modelManager is absent. */
  model?: LanguageModel
  /** Current dashboard working context — refreshed before each user turn. */
  dashboardContext: BiDashboardContext
  /**
   * Remote tool executor — forwards calls to frontend via WebSocket.
   * Optional when ToolRegistry.registerExecutor() was called at startup.
   */
  remoteExecutor?: IRemoteToolExecutor
  /** Executor channel when using ToolRegistry. Default: `bi_ws`. */
  executorChannel?: string
  /** Hard cap on tool-call rounds per invocation. Default: 20. */
  maxTurns?: number
  /** Max identical tool calls before soft-block. Default: 3. */
  softLoopThreshold?: number
  /** Max identical tool calls before hard-abort. Default: 5. */
  hardLoopThreshold?: number
  /** Per-tool execution timeout in ms. Default: 30_000. */
  toolTimeoutMs?: number
  /** Tool names allowed for this session. Absent = all registered BI tools. */
  toolAllowList?: string[]
  /** Tool names denied for this session. */
  toolDenyList?: string[]
  /** Abort signal for user cancellation. */
  abortSignal?: AbortSignal
}
