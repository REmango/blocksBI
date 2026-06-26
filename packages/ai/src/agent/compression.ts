import type { LanguageModel, ModelMessage } from 'ai'

import type { BiAgentCallbacks } from '../types/callbacks'
import { estimateTokenCount, getCompressionThreshold } from './context-window'
import type { BiLoopState } from './loop-state'
import { defaultLlmScheduler } from '../llm/scheduler'

export const KEEP_RECENT = 6

export async function compressMessages(
  messages: ModelMessage[],
  model: LanguageModel,
): Promise<ModelMessage[]> {
  let keepCount = KEEP_RECENT
  while (keepCount < messages.length && messages[messages.length - keepCount]?.role === 'tool') {
    keepCount++
  }
  const recent = messages.slice(-keepCount)
  const old = messages.slice(0, -keepCount)
  if (old.length === 0) return messages

  const summary = await defaultLlmScheduler.summarizeMessages(model, old)
  return [{ role: 'user', content: `[Previous conversation summary]\n${summary}` }, ...recent]
}

export function lightCompactMessages(messages: ModelMessage[]): {
  messages: ModelMessage[]
  removed: number
} {
  const filtered: ModelMessage[] = []
  let removed = 0
  for (const msg of messages) {
    if (msg.role === 'tool') {
      const content = msg.content
      const text =
        typeof content === 'string'
          ? content
          : Array.isArray(content)
            ? content
                .map((p) => ('output' in p && p.output && 'value' in p.output ? p.output.value : ''))
                .join('')
            : ''
      if (text.startsWith('[loop-guard]')) {
        removed++
        continue
      }
    }
    filtered.push(msg)
  }
  return { messages: filtered, removed }
}

export async function checkAndCompressContext(
  state: BiLoopState,
  model: LanguageModel,
  modelId: string,
  callbacks: BiAgentCallbacks,
): Promise<void> {
  const threshold = getCompressionThreshold(modelId)
  const needsCompression =
    state.lastInputTokens > threshold || estimateTokenCount(state.messages) > threshold

  if (!needsCompression || state.messages.length <= KEEP_RECENT) return

  const light = lightCompactMessages(state.messages)
  if (light.removed > 0) {
    state.messages = light.messages
    callbacks.onContextCompressed?.(`Removed ${light.removed} loop-guard messages.`)
  }

  const stillOver =
    state.lastInputTokens > threshold || estimateTokenCount(state.messages) > threshold
  if (!stillOver || state.messages.length <= KEEP_RECENT) return

  state.messages = await compressMessages(state.messages, model)
  state.expectCacheMiss = true
  state.systemPromptCache = null
  callbacks.onContextCompressed?.('Conversation history summarized to fit context window.')
}

export async function handleContextTooLong(
  state: BiLoopState,
  model: LanguageModel,
  callbacks: BiAgentCallbacks,
): Promise<boolean> {
  if (state.reactiveCompactUsed) return false
  state.reactiveCompactUsed = true
  state.messages = await compressMessages(state.messages, model)
  state.expectCacheMiss = true
  state.systemPromptCache = null
  callbacks.onContextCompressed?.('Context overflow — compressed and retrying.')
  return true
}
