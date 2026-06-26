import { createHash } from 'node:crypto'

import type { OperationLogEntry, TokenUsage } from '../types/index'
import type { ModelMessage } from 'ai'

export const DEFAULT_MAX_TURNS = 20
export const DEFAULT_TOOL_TIMEOUT_MS = 30_000

export interface BiLoopState {
  messages: ModelMessage[]
  tokenUsage: TokenUsage
  lastInputTokens: number
  sessionId: string
  dashboardId: string
  /** Active model id for this session — updated on switch. */
  modelId: string
  startedAt: string
  recentToolCalls: Array<{ toolName: string; hash: string }>
  systemPromptCache: string | null
  turnCount: number
  operationLogs: OperationLogEntry[]
  prevTurnCacheRead: number
  expectCacheMiss: boolean
  reactiveCompactUsed: boolean
}

function generateSessionId(now: Date = new Date()): string {
  const pad = (n: number, w = 2) => String(n).padStart(w, '0')
  return (
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}` +
    `-${pad(now.getMilliseconds(), 3)}`
  )
}

export function createLoopState(
  dashboardId: string,
  sessionId?: string,
  modelId = '',
): BiLoopState {
  return {
    messages: [],
    tokenUsage: {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
      currentContextTokens: 0,
    },
    lastInputTokens: 0,
    sessionId: sessionId ?? generateSessionId(),
    dashboardId,
    modelId,
    startedAt: new Date().toISOString(),
    recentToolCalls: [],
    systemPromptCache: null,
    turnCount: 0,
    operationLogs: [],
    prevTurnCacheRead: 0,
    expectCacheMiss: false,
    reactiveCompactUsed: false,
  }
}

export function hashToolCall(toolName: string, input: unknown): string {
  const payload = toolName + '\x00' + stableStringify(input)
  return createHash('sha256').update(payload).digest('hex').slice(0, 16)
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']'
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )
  return (
    '{' + entries.map(([k, v]) => JSON.stringify(k) + ':' + stableStringify(v)).join(',') + '}'
  )
}
