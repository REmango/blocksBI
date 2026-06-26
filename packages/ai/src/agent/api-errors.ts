export function classifyApiError(err: unknown): { message: string; isContextTooLong: boolean } {
  const raw = err instanceof Error ? err.message : String(err)
  const lower = raw.toLowerCase()

  if (
    lower.includes('context_length') ||
    lower.includes('context length') ||
    lower.includes('maximum context') ||
    lower.includes('prompt is too long') ||
    lower.includes('token limit')
  ) {
    return { message: 'Context window exceeded. Compressing and retrying.', isContextTooLong: true }
  }

  if (lower.includes('rate limit') || lower.includes('429')) {
    return { message: 'Rate limit reached. Please wait and try again.', isContextTooLong: false }
  }

  if (lower.includes('aborted') || lower.includes('abort')) {
    return { message: 'Request was cancelled.', isContextTooLong: false }
  }

  return { message: raw || 'Unknown API error', isContextTooLong: false }
}

export function isContextTooLongError(err: unknown): boolean {
  return classifyApiError(err).isContextTooLong
}

export function isAbortError(err: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) return true
  if (err instanceof Error) {
    if (err.name === 'AbortError') return true
    if (/aborted|AbortError/i.test(err.message)) return true
  }
  return false
}
