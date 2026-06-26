// WS tool transport layer
export {
  WS_TOOL_EVENTS,
  DEFAULT_WS_EXECUTOR_CHANNEL,
  WsToolService,
  PendingRequestRegistry,
} from './ws'
export type {
  IWsToolTransport,
  RemoteToolAck,
  RemoteToolRequest,
  RemoteToolProgress,
  WsEmitter,
  WsToolServiceOptions,
  WsToolEventName,
} from './ws'

// Remote tool executor (adapter layer)
export { BiWsToolExecutor, createRemoteToolRunner } from './executor'
export type {
  IRemoteToolExecutor,
  RemoteToolExecutor,
  CreateRemoteToolRunnerOptions,
} from './executor'

// Tool executor registry (DI)
export { ToolRegistry, toolRegistry, resolveRemoteExecutor } from './tools/registry'

// Model management
export {
  BiModelManager,
  createBiModelRegistry,
  resolveModelId,
  getAvailableProviders,
  saveBiConfig,
  loadBiConfig,
  applyModelSwitch,
  MODEL_ALIASES,
  PROVIDER_MODELS,
  PROVIDER_DETECTION_ORDER,
  listConfiguredProviderModels,
} from './providers'
export type { BiModelRegistry, ProviderModel, ModelSwitchResult, BiUserConfig } from './providers'

// Agent loop kernel
export { biAgentLoop, createLoopState, switchBiAgentModel } from './agent/loop'
export type { BiAgentLoopResult, BiLoopState } from './agent/loop'

// System prompt
export { buildBiSystemPrompt } from './agent/system-prompt'

// Context management
export {
  getContextWindow,
  getCompressionThreshold,
  getMaxOutputTokens,
  estimateTokenCount,
  truncateToolResult,
} from './agent/context-window'
export { compressMessages, checkAndCompressContext } from './agent/compression'

// Loop guard
export {
  checkForLoop,
  recordToolCall,
  SOFT_LOOP_THRESHOLD,
  HARD_LOOP_THRESHOLD,
} from './agent/loop-guard'

// Tool execution
export { processToolCalls } from './agent/tool-execution'

// LLM scheduler
export { LlmScheduler, defaultLlmScheduler } from './llm/scheduler'
export { RateLimiter, defaultRateLimiter } from './llm/rate-limiter'

// BI tool definitions
export {
  biToolRegistry,
  buildBiToolSet,
  listBiToolNames,
  isMutatingTool,
  MUTATING_TOOLS,
  validateToolInput,
  tryAutoCorrectInput,
  ToolValidationError,
  createPermissionHook,
  createAuditHook,
  ToolHookRunner,
} from './tools/registry'

// Types
export type {
  BiDashboardContext,
  BiComponentSummary,
  BiPageSummary,
  BiAgentCallbacks,
  BiAgentOptions,
  TokenUsage,
  OperationLogEntry,
} from './types/index'

export type { BiToolDefinition, BiToolCategory, BiToolMutability } from './tools/registry'

// Messages
export {
  userMessage,
  toolResultMessage,
  toolErrorString,
  isToolErrorString,
} from './agent/messages'
export type { UserContent } from './agent/messages'
