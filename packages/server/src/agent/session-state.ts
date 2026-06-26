import type { BiLoopState } from '@block-bi/ai'

const sessionStates = new Map<string, BiLoopState>()

const MAX_SESSION_MESSAGES = 40
const MAX_OPERATION_LOGS = 100
const MAX_CACHED_SESSIONS = 20

function trimLoopState(state: BiLoopState): BiLoopState {
  if (state.messages.length > MAX_SESSION_MESSAGES) {
    state.messages = state.messages.slice(-MAX_SESSION_MESSAGES)
  }
  if (state.operationLogs.length > MAX_OPERATION_LOGS) {
    state.operationLogs = state.operationLogs.slice(-MAX_OPERATION_LOGS)
  }
  return state
}

function evictOldestSessionState(): void {
  if (sessionStates.size <= MAX_CACHED_SESSIONS) return
  const oldestKey = sessionStates.keys().next().value
  if (oldestKey) {
    sessionStates.delete(oldestKey)
  }
}

export function getSessionState(sessionId: string): BiLoopState | undefined {
  return sessionStates.get(sessionId)
}

export function setSessionState(sessionId: string, state: BiLoopState): void {
  if (!sessionStates.has(sessionId)) {
    evictOldestSessionState()
  }
  sessionStates.set(sessionId, trimLoopState(state))
}

export function clearSessionState(sessionId: string): void {
  sessionStates.delete(sessionId)
}
