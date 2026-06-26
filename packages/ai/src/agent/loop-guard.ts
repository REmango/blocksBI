import type { BiLoopState } from './loop-state'
import { hashToolCall } from './loop-state'
import { toolResultMessage } from './messages'

export const SOFT_LOOP_THRESHOLD = 3
export const HARD_LOOP_THRESHOLD = 5
export const LOOP_WINDOW_SIZE = 8

interface LoopCheckBase {
  hash: string
}

export type LoopCheck =
  | (LoopCheckBase & { kind: 'ok' })
  | (LoopCheckBase & { kind: 'soft-block'; toolCallId: string; message: string })
  | (LoopCheckBase & { kind: 'hard-block'; toolName: string; message: string })

export function checkForLoop(
  state: BiLoopState,
  toolName: string,
  input: unknown,
  toolCallId: string,
  softThreshold = SOFT_LOOP_THRESHOLD,
  hardThreshold = HARD_LOOP_THRESHOLD,
): LoopCheck {
  const hash = hashToolCall(toolName, input)
  const window = state.recentToolCalls.slice(-LOOP_WINDOW_SIZE)

  let priorMatches = 0
  for (const entry of window) {
    if (entry.toolName === toolName && entry.hash === hash) priorMatches++
  }

  if (priorMatches + 1 >= hardThreshold) {
    return {
      kind: 'hard-block',
      hash,
      toolName,
      message: `Tool ${toolName} has been called with identical arguments ${priorMatches + 1} times. Aborting to prevent infinite loop.`,
    }
  }

  if (priorMatches + 1 >= softThreshold) {
    return {
      kind: 'soft-block',
      hash,
      toolCallId,
      message:
        `This exact ${toolName} call has already been attempted ${priorMatches + 1} times with the same result. ` +
        'Change your approach — alter arguments, try a different tool, or ask the user.',
    }
  }

  return { kind: 'ok', hash }
}

export function recordToolCall(
  state: BiLoopState,
  toolName: string,
  input: unknown,
  hash?: string,
): void {
  const h = hash ?? hashToolCall(toolName, input)
  state.recentToolCalls.push({ toolName, hash: h })
  const cap = LOOP_WINDOW_SIZE * 2
  if (state.recentToolCalls.length > cap) {
    state.recentToolCalls.splice(0, state.recentToolCalls.length - cap)
  }
}

export function syntheticLoopBlockResult(toolName: string, toolCallId: string, message: string) {
  return toolResultMessage(toolCallId, toolName, `[loop-guard] ${message}`)
}
