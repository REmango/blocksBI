export type { BiDashboardContext, BiComponentSummary, BiPageSummary } from './bi-context'
export type { BiAgentCallbacks } from './callbacks'
export type { BiAgentOptions } from './options'

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cacheReadTokens: number
  cacheCreationTokens: number
  currentContextTokens: number
}

export interface OperationLogEntry {
  id: string
  timestamp: string
  toolName: string
  input: Record<string, unknown>
  result: string
  isError: boolean
  durationMs: number
}
