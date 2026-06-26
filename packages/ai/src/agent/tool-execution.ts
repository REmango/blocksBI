import { randomUUID } from 'node:crypto'

import type { ModelMessage } from 'ai'

import type { BiAgentCallbacks } from '../types/callbacks'
import type { BiAgentOptions } from '../types/options'
import type { OperationLogEntry } from '../types/index'
import { checkForLoop, recordToolCall, syntheticLoopBlockResult } from './loop-guard'
import type { BiLoopState } from './loop-state'
import {
  isToolErrorString,
  toolErrorFromUnknown,
  toolErrorString,
  toolResultMessage,
} from './messages'
import { truncateToolResult } from './context-window'
import { createRemoteToolRunner } from '../executor/remote-tool-runner'
import { resolveRemoteExecutor } from '../tools/resolve-executor'
import {
  biToolRegistry,
  createAuditHook,
  createPermissionHook,
  getToolDefinition,
  ToolHookRunner,
  tryAutoCorrectInput,
  validateToolInput,
  ToolValidationError,
} from '../tools/registry'

const MAX_RETRIES = 1

export interface ProcessToolCallsResult {
  messages: ModelMessage[]
  shouldStop: boolean
  stopReason?: string
}

function getInputSchema(toolName: string): import('zod').ZodTypeAny | undefined {
  const def = getToolDefinition(biToolRegistry, toolName)
  return def?.inputSchema
}

function collectFulfilledToolCallIds(messages: ModelMessage[]): Set<string> {
  const ids = new Set<string>()
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (!msg) continue
    if (msg.role === 'user') break
    if (msg.role !== 'tool') continue
    if (!Array.isArray(msg.content)) continue
    for (const part of msg.content as Array<{ type?: string; toolCallId?: string }>) {
      if (part?.type === 'tool-result' && typeof part.toolCallId === 'string') {
        ids.add(part.toolCallId)
      }
    }
  }
  return ids
}

async function executeWithRetry(
  runRemote: ReturnType<typeof createRemoteToolRunner>,
  toolName: string,
  input: Record<string, unknown>,
  signal: AbortSignal | undefined,
  timeoutMs: number,
): Promise<{ result: string; isError: boolean }> {
  let lastError = ''
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const ack = await runRemote(toolName, input, signal, timeoutMs)
      if (ack.ok && ack.result !== undefined) {
        return { result: truncateToolResult(ack.result), isError: false }
      }
      lastError = ack.error ?? 'Remote tool returned failure'
      if (attempt < MAX_RETRIES) {
        input = tryAutoCorrectInput(toolName, input)
        continue
      }
      return { result: toolErrorString(lastError), isError: true }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      if (attempt < MAX_RETRIES) continue
      return { result: toolErrorFromUnknown(err), isError: true }
    }
  }
  return { result: toolErrorString(lastError), isError: true }
}

export async function processToolCalls(
  toolCalls: Array<{ toolCallId: string; toolName: string; input: Record<string, unknown> }>,
  state: BiLoopState,
  options: BiAgentOptions,
  callbacks: BiAgentCallbacks,
): Promise<ProcessToolCallsResult> {
  const results: ModelMessage[] = []
  const timeoutMs = options.toolTimeoutMs ?? 30_000
  const softThreshold = options.softLoopThreshold ?? 3
  const hardThreshold = options.hardLoopThreshold ?? 5
  const fulfilledIds = collectFulfilledToolCallIds(state.messages)

  const remoteExecutor = resolveRemoteExecutor({
    remoteExecutor: options.remoteExecutor,
    executorChannel: options.executorChannel,
  })
  const runRemote = createRemoteToolRunner({
    executor: remoteExecutor,
    sessionId: state.sessionId,
    dashboardId: state.dashboardId,
    defaultTimeoutMs: timeoutMs,
  })

  const hookRunner = new ToolHookRunner(
    [createPermissionHook(options.toolAllowList, options.toolDenyList)],
    [
      createAuditHook((entry) => {
        state.operationLogs.push({
          id: randomUUID(),
          timestamp: new Date().toISOString(),
          toolName: entry.toolName,
          input: entry.input,
          result: entry.result,
          isError: entry.isError,
          durationMs: entry.durationMs,
        })
      }),
    ],
  )

  for (const call of toolCalls) {
    const { toolCallId, toolName, input: rawInput } = call

    if (fulfilledIds.has(toolCallId)) {
      continue
    }

    callbacks.onToolCall(toolCallId, toolName, rawInput)

    const loopCheck = checkForLoop(state, toolName, rawInput, toolCallId, softThreshold, hardThreshold)
    if (loopCheck.kind === 'hard-block') {
      return { messages: results, shouldStop: true, stopReason: loopCheck.message }
    }
    if (loopCheck.kind === 'soft-block') {
      const synthetic = syntheticLoopBlockResult(toolName, toolCallId, loopCheck.message)
      results.push(synthetic)
      callbacks.onToolResult(toolCallId, loopCheck.message, true)
      recordToolCall(state, toolName, rawInput, loopCheck.hash)
      continue
    }

    const def = getToolDefinition(biToolRegistry, toolName)
    if (!def) {
      const err = toolErrorString(`Unknown tool: ${toolName}`)
      results.push(toolResultMessage(toolCallId, toolName, err))
      callbacks.onToolResult(toolCallId, err, true)
      recordToolCall(state, toolName, rawInput, loopCheck.hash)
      continue
    }

    let input = tryAutoCorrectInput(toolName, rawInput)
    const schema = getInputSchema(toolName)
    if (schema) {
      try {
        input = validateToolInput(schema, input, toolName) as Record<string, unknown>
      } catch (err) {
        const msg = err instanceof ToolValidationError ? err.message : toolErrorFromUnknown(err)
        results.push(toolResultMessage(toolCallId, toolName, msg))
        callbacks.onToolResult(toolCallId, msg, true)
        recordToolCall(state, toolName, rawInput, loopCheck.hash)
        continue
      }
    }

    const preResult = await hookRunner.runPreHooks({
      sessionId: state.sessionId,
      dashboardId: state.dashboardId,
      toolName,
      input,
      toolCallId,
    })
    if (!preResult.proceed) {
      const err = toolErrorString(preResult.reason ?? 'Permission denied')
      results.push(toolResultMessage(toolCallId, toolName, err))
      callbacks.onToolResult(toolCallId, err, true)
      recordToolCall(state, toolName, rawInput, loopCheck.hash)
      continue
    }
    if (preResult.correctedInput) input = preResult.correctedInput

    const start = Date.now()
    callbacks.onToolProgress(toolCallId, `Executing ${toolName}...`)

    const { result, isError } = await executeWithRetry(
      runRemote,
      toolName,
      input,
      options.abortSignal,
      timeoutMs,
    )

    const durationMs = Date.now() - start
    results.push(toolResultMessage(toolCallId, toolName, result))
    callbacks.onToolResult(toolCallId, result, isError || isToolErrorString(result))

    await hookRunner.runPostHooks({
      sessionId: state.sessionId,
      dashboardId: state.dashboardId,
      toolName,
      input,
      toolCallId,
      result,
      isError: isError || isToolErrorString(result),
      durationMs,
    })

    recordToolCall(state, toolName, input, loopCheck.hash)
  }

  return { messages: results, shouldStop: false }
}
