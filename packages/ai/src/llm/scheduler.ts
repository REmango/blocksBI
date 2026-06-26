import { generateText, streamText } from 'ai'
import type { LanguageModel, ModelMessage, ToolSet, UserContent } from 'ai'

import { defaultRateLimiter } from './rate-limiter'
import { getMaxOutputTokens } from '../agent/context-window'

export type StreamTextResult = Awaited<ReturnType<typeof streamText>>

export interface LlmStreamOptions {
  model: LanguageModel
  modelId: string
  system: string
  messages: ModelMessage[]
  tools: ToolSet
  abortSignal?: AbortSignal
}

export interface LlmGenerateOptions {
  model: LanguageModel
  system: string
  messages: ModelMessage[]
  abortSignal?: AbortSignal
}

/** Unified LLM scheduling — rate limiting + max output tokens. */
export class LlmScheduler {
  constructor(private readonly limiter = defaultRateLimiter) {}

  async stream(options: LlmStreamOptions): Promise<StreamTextResult> {
    await this.limiter.acquire()
    return streamText({
      model: options.model,
      system: options.system,
      messages: options.messages,
      tools: options.tools,
      maxOutputTokens: getMaxOutputTokens(options.modelId),
      abortSignal: options.abortSignal,
    })
  }

  async generate(options: LlmGenerateOptions): Promise<string> {
    await this.limiter.acquire()
    const { text } = await generateText({
      model: options.model,
      system: options.system,
      messages: options.messages,
      abortSignal: options.abortSignal,
    })
    return text
  }

  async summarizeMessages(model: LanguageModel, messages: ModelMessage[]): Promise<string> {
    await this.limiter.acquire()
    const { text } = await generateText({
      model,
      system:
        'Summarize the following BI assistant conversation concisely. Preserve layout decisions, component IDs referenced, and user preferences.',
      messages,
    })
    return text
  }
}

export const defaultLlmScheduler = new LlmScheduler()

export type { UserContent }
