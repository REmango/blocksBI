import type { ModelMessage } from 'ai'

/** Compress when usage exceeds this fraction of the model context window. */
export const COMPRESSION_TRIGGER_RATIO = 0.8

const CHARS_PER_TOKEN_ESTIMATE = 3.0
const DEFAULT_CONTEXT_WINDOW = 128_000

const MODEL_CONTEXT_WINDOWS: ReadonlyMap<string, number> = new Map([
  ['anthropic:claude-opus-4-7', 1_000_000],
  ['anthropic:claude-sonnet-4-6', 1_000_000],
  ['anthropic:claude-haiku-4-5', 200_000],
  ['openai:gpt-4.1', 1_047_576],
  ['openai:gpt-4.1-mini', 1_047_576],
  ['openai:o3', 200_000],
  ['openai:o4-mini', 200_000],
  ['google:gemini-2.5-pro', 1_000_000],
  ['google:gemini-2.5-flash', 1_000_000],
  ['deepseek:deepseek-v4-flash', 1_000_000],
  ['deepseek:deepseek-v4-pro', 1_000_000],
  ['alibaba:qwen-turbo', 1_000_000],
  ['alibaba:qwen-plus', 131_072],
  ['alibaba:qwen3-max', 262_144],
  ['moonshotai:kimi-k2.5', 131_072],
])

const PROVIDER_CONTEXT_WINDOWS: ReadonlyMap<string, number> = new Map([
  ['anthropic', 1_000_000],
  ['openai', 128_000],
  ['google', 1_000_000],
  ['deepseek', 1_000_000],
  ['alibaba', 128_000],
  ['moonshotai', 128_000],
])

export function getContextWindow(modelId: string): number {
  const exact = MODEL_CONTEXT_WINDOWS.get(modelId)
  if (exact !== undefined) return exact
  const provider = modelId.split(':')[0]
  return PROVIDER_CONTEXT_WINDOWS.get(provider) ?? DEFAULT_CONTEXT_WINDOW
}

export function getCompressionThreshold(modelId: string): number {
  return Math.floor(getContextWindow(modelId) * COMPRESSION_TRIGGER_RATIO)
}

const DEFAULT_MAX_OUTPUT_TOKENS = 16_384
const MODEL_MAX_OUTPUT_TOKENS: ReadonlyMap<string, number> = new Map([
  ['deepseek:deepseek-v4-flash', 131_072],
  ['deepseek:deepseek-v4-pro', 131_072],
  ['alibaba:qwen-turbo', 16_384],
  ['alibaba:qwen-plus', 32_000],
  ['alibaba:qwen3-max', 32_000],
])

export function getMaxOutputTokens(modelId: string): number {
  return MODEL_MAX_OUTPUT_TOKENS.get(modelId) ?? DEFAULT_MAX_OUTPUT_TOKENS
}

export function estimateTokenCount(messages: ModelMessage[]): number {
  let chars = 0
  for (const msg of messages) {
    if (typeof msg.content === 'string') {
      chars += msg.content.length
      continue
    }
    if (!Array.isArray(msg.content)) continue

    for (const part of msg.content as Array<Record<string, unknown>>) {
      if (typeof part.text === 'string') {
        chars += part.text.length
        continue
      }
      const output = part.output as { type?: string; value?: unknown } | undefined
      if (output?.value !== undefined) {
        chars +=
          typeof output.value === 'string'
            ? output.value.length
            : JSON.stringify(output.value).length
      }
    }
  }
  return Math.ceil(chars / CHARS_PER_TOKEN_ESTIMATE)
}

export const MAX_TOOL_RESULT_LINES = 500
export const MAX_TOOL_RESULT_BYTES = 64 * 1024

export function truncateToolResult(raw: string): string {
  if (Buffer.byteLength(raw, 'utf-8') <= MAX_TOOL_RESULT_BYTES) {
    const lines = raw.split('\n')
    if (lines.length <= MAX_TOOL_RESULT_LINES) return raw
    return (
      lines.slice(0, MAX_TOOL_RESULT_LINES).join('\n') +
      `\n\n[Truncated: ${lines.length - MAX_TOOL_RESULT_LINES} more lines omitted]`
    )
  }
  let bytes = 0
  const lines: string[] = []
  for (const line of raw.split('\n')) {
    const added = Buffer.byteLength(line, 'utf-8') + (lines.length > 0 ? 1 : 0)
    if (bytes + added > MAX_TOOL_RESULT_BYTES && lines.length > 0) break
    lines.push(line)
    bytes += added
  }
  return lines.join('\n') + '\n\n[Truncated: output exceeded size limit]'
}
