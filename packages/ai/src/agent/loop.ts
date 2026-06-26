import type { LanguageModel, ModelMessage, UserContent } from 'ai'

import { classifyApiError, isAbortError, isContextTooLongError } from './api-errors'
import { checkAndCompressContext, handleContextTooLong } from './compression'
import { truncateToolResult } from './context-window'
import { checkForLoop } from './loop-guard'
import { createLoopState, DEFAULT_MAX_TURNS, type BiLoopState } from './loop-state'
import type { UserContent as BiUserContent } from './messages'
import { buildBiSystemPrompt } from './system-prompt'
import { drainStreamResult, type StreamResult } from './stream-utils'
import { processToolCalls } from './tool-execution'
import { defaultLlmScheduler } from '../llm/scheduler'
import { applyModelSwitch, BiModelManager, type ModelSwitchResult } from '../providers'
import { buildBiToolSet } from '../tools/registry'
import type { BiAgentCallbacks } from '../types/callbacks'
import type { BiAgentOptions } from '../types/options'

export type { BiLoopState } from './loop-state'
export { createLoopState } from './loop-state'

export interface BiAgentLoopResult {
  state: BiLoopState
  finished: boolean
  finishReason?: string
}

type TurnOutcome =
  | { kind: 'done'; finishReason: string; result: StreamResult }
  | { kind: 'error' }
  | { kind: 'retry' }
  | { kind: 'aborted' }

interface RuntimeModel {
  modelId: string
  model: LanguageModel
}

function resolveRuntimeModel(options: BiAgentOptions): RuntimeModel {
  if (options.modelManager) {
    return {
      modelId: options.modelManager.getModelId(),
      model: options.modelManager.getModel(),
    }
  }
  if (options.modelId && options.model) {
    return { modelId: options.modelId, model: options.model }
  }
  throw new Error(
    'BiAgentOptions requires modelManager or both modelId and model. Use BiModelManager.create().',
  )
}

function syncModelState(
  state: BiLoopState,
  runtime: RuntimeModel,
  callbacks: BiAgentCallbacks,
): void {
  if (!state.modelId) {
    state.modelId = runtime.modelId
    return
  }
  if (state.modelId === runtime.modelId) return

  const previousModelId = state.modelId
  applyModelSwitch(state, {
    previousModelId,
    modelId: runtime.modelId,
    model: runtime.model,
  })
  callbacks.onModelSwitch?.(runtime.modelId, previousModelId)
}

function repairOrphanToolCalls(messages: ModelMessage[]): void {
  const pending = new Map<string, { toolName: string }>()
  for (const msg of messages) {
    if (msg.role === 'assistant' && Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === 'tool-call') {
          pending.set(part.toolCallId, { toolName: part.toolName })
        }
      }
    }
    if (msg.role === 'tool' && Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === 'tool-result') {
          pending.delete(part.toolCallId)
        }
      }
    }
  }
  for (const [toolCallId, { toolName }] of pending) {
    messages.push({
      role: 'tool',
      content: [
        {
          type: 'tool-result',
          toolCallId,
          toolName,
          output: { type: 'text', value: 'Error: Tool call was interrupted before completion.' },
        },
      ],
    })
  }
}

async function streamChunksToUI(result: StreamResult, callbacks: BiAgentCallbacks): Promise<void> {
  for await (const chunk of result.fullStream) {
    if (chunk.type === 'error') {
      throw chunk.error instanceof Error ? chunk.error : new Error(String(chunk.error))
    }
    if (chunk.type === 'text-delta') {
      callbacks.onTextDelta(chunk.text ?? '')
    } else if (chunk.type === 'tool-call') {
      callbacks.onToolCall(
        chunk.toolCallId ?? '',
        chunk.toolName ?? '',
        (chunk.input ?? {}) as Record<string, unknown>,
      )
    } else if (chunk.type === 'tool-result') {
      const raw =
        typeof chunk.output === 'string' ? chunk.output : JSON.stringify(chunk.output ?? '')
      callbacks.onToolResult(chunk.toolCallId ?? '', truncateToolResult(raw))
    }
  }
}

async function collectTurnResponse(
  result: StreamResult,
  state: BiLoopState,
  callbacks: BiAgentCallbacks,
): Promise<void> {
  const response = await result.response
  state.messages.push(...response.messages)

  const usage = await result.usage
  if (usage) {
    state.tokenUsage.inputTokens += usage.inputTokens ?? 0
    state.tokenUsage.outputTokens += usage.outputTokens ?? 0
    state.tokenUsage.cacheReadTokens += usage.inputTokenDetails?.cacheReadTokens ?? 0
    state.tokenUsage.cacheCreationTokens += usage.inputTokenDetails?.cacheWriteTokens ?? 0
    state.tokenUsage.totalTokens = state.tokenUsage.inputTokens + state.tokenUsage.outputTokens
    state.tokenUsage.currentContextTokens = (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0)
    if (usage.inputTokens != null) state.lastInputTokens = usage.inputTokens
    callbacks.onUsageUpdate(state.tokenUsage)
  }
}

async function runTurn(
  state: BiLoopState,
  runtime: RuntimeModel,
  options: BiAgentOptions,
  systemPrompt: string,
  callbacks: BiAgentCallbacks,
  effectiveTools: ReturnType<typeof buildBiToolSet>,
): Promise<TurnOutcome> {
  repairOrphanToolCalls(state.messages)

  let result: StreamResult
  try {
    result = await defaultLlmScheduler.stream({
      model: runtime.model,
      modelId: runtime.modelId,
      system: systemPrompt,
      messages: state.messages,
      tools: effectiveTools,
      abortSignal: options.abortSignal,
    })
  } catch (err) {
    if (isAbortError(err, options.abortSignal)) return { kind: 'aborted' }
    if (isContextTooLongError(err)) {
      const retried = await handleContextTooLong(state, runtime.model, callbacks)
      if (retried) return { kind: 'retry' }
    }
    callbacks.onError(new Error(classifyApiError(err).message))
    return { kind: 'error' }
  }

  try {
    await streamChunksToUI(result, callbacks)
    await collectTurnResponse(result, state, callbacks)
    const finishReason = (await result.finishReason) ?? 'stop'
    return { kind: 'done', finishReason, result }
  } catch (err) {
    drainStreamResult(result)
    if (isAbortError(err, options.abortSignal)) return { kind: 'aborted' }
    if (isContextTooLongError(err)) {
      const retried = await handleContextTooLong(state, runtime.model, callbacks)
      if (retried) return { kind: 'retry' }
    }
    callbacks.onError(new Error(classifyApiError(err).message))
    return { kind: 'error' }
  }
}

/**
 * BI Agent Loop — orchestrates LLM streaming, remote tool dispatch, and context management.
 *
 * Flow: intent parsing → tool selection → param validation → remote execution → result backfill → loop
 */
export async function biAgentLoop(
  userMessage: BiUserContent,
  options: BiAgentOptions,
  callbacks: BiAgentCallbacks,
  existingState?: BiLoopState,
): Promise<BiAgentLoopResult> {
  const runtime = resolveRuntimeModel(options)

  const state =
    existingState ??
    createLoopState(
      options.dashboardContext.dashboardId,
      options.dashboardContext.sessionId,
      runtime.modelId,
    )

  syncModelState(state, runtime, callbacks)

  state.turnCount = 0
  state.recentToolCalls = []

  repairOrphanToolCalls(state.messages)

  state.messages.push({ role: 'user', content: userMessage })

  const maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS

  const effectiveTools = buildBiToolSet({
    allowList: options.toolAllowList,
    denyList: options.toolDenyList,
  })

  state.systemPromptCache = buildBiSystemPrompt({
    modelId: runtime.modelId,
    context: options.dashboardContext,
  })

  const MAX_CONTINUATIONS = 3
  let continuationAttempts = 0
  let emptyToolCallTurns = 0

  while (true) {
    if (state.turnCount >= maxTurns) {
      callbacks.onError(new Error(`Reached maximum turns (${maxTurns}). Stopping agent loop.`))
      return { state, finished: true, finishReason: 'max-turns' }
    }
    state.turnCount++

    await checkAndCompressContext(state, runtime.model, runtime.modelId, callbacks)

    const systemPrompt =
      state.systemPromptCache ??
      buildBiSystemPrompt({
        modelId: runtime.modelId,
        context: options.dashboardContext,
      })

    const outcome = await runTurn(state, runtime, options, systemPrompt, callbacks, effectiveTools)

    if (outcome.kind === 'error' || outcome.kind === 'aborted') {
      return { state, finished: true, finishReason: outcome.kind }
    }
    if (outcome.kind === 'retry') {
      state.turnCount--
      continue
    }

    if (outcome.finishReason === 'tool-calls') {
      continuationAttempts = 0
      let toolCalls: Awaited<StreamResult['toolCalls']>
      try {
        toolCalls = await outcome.result.toolCalls
      } catch (err) {
        if (isAbortError(err, options.abortSignal)) {
          return { state, finished: true, finishReason: 'aborted' }
        }
        callbacks.onError(new Error(classifyApiError(err).message))
        return { state, finished: true, finishReason: 'error' }
      }

      if (!toolCalls || toolCalls.length === 0) {
        emptyToolCallTurns++
        if (emptyToolCallTurns >= 3) {
          callbacks.onError(new Error('Model returned tool-calls without executable tool calls.'))
          return { state, finished: true, finishReason: 'error' }
        }
        continue
      }

      emptyToolCallTurns = 0

      const calls = toolCalls.map((tc) => ({
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        input: (tc.input ?? {}) as Record<string, unknown>,
      }))

      const toolResult = await processToolCalls(calls, state, options, callbacks)
      state.messages.push(...toolResult.messages)

      if (toolResult.shouldStop) {
        callbacks.onError(new Error(toolResult.stopReason ?? 'Tool loop guard triggered'))
        return { state, finished: true, finishReason: 'loop-guard' }
      }

      if (options.abortSignal?.aborted) {
        return { state, finished: true, finishReason: 'aborted' }
      }
      continue
    }

    if (outcome.finishReason === 'length') {
      if (continuationAttempts < MAX_CONTINUATIONS) {
        continuationAttempts++
        state.messages.push({
          role: 'user',
          content: 'Output token limit hit. Continue your response from where you left off.',
        })
        continue
      }
      callbacks.onError(new Error('Response truncated after maximum continuation attempts.'))
      return { state, finished: true, finishReason: 'length' }
    }

    return { state, finished: true, finishReason: outcome.finishReason }
  }
}

export type { UserContent, LanguageModel }

/** Switch model for an existing session state (e.g. from API handler). */
export function switchBiAgentModel(
  state: BiLoopState,
  modelManager: BiModelManager,
  modelInput: string,
  callbacks?: Pick<BiAgentCallbacks, 'onModelSwitch'>,
): ModelSwitchResult {
  const result = modelManager.switchModel(modelInput)
  applyModelSwitch(state, result)
  callbacks?.onModelSwitch?.(result.modelId, result.previousModelId)
  return result
}
