export const AGENT_SESSION_SYNC_CHANNEL = 'blocksbi-agent-session-sync'

export type SessionSyncMessage =
  | { type: 'session-changed'; dashboardId: string; sessionId: string }
  | { type: 'messages-changed'; dashboardId: string; sessionId: string }

/** In-memory only — used for cross-tab runtime sync within the same browser session. */
const activeSessionByDashboard = new Map<string, string>()

let syncChannel: BroadcastChannel | null = null

function getSyncChannel(): BroadcastChannel {
  if (!syncChannel) {
    syncChannel = new BroadcastChannel(AGENT_SESSION_SYNC_CHANNEL)
  }
  return syncChannel
}

export function getActiveSessionId(dashboardId: string): string | null {
  return activeSessionByDashboard.get(dashboardId) ?? null
}

/** Track active session in memory and notify other tabs (no localStorage). */
export function setActiveSessionId(dashboardId: string, sessionId: string): void {
  if (activeSessionByDashboard.get(dashboardId) === sessionId) {
    return
  }

  activeSessionByDashboard.set(dashboardId, sessionId)

  getSyncChannel().postMessage({
    type: 'session-changed',
    dashboardId,
    sessionId,
  } satisfies SessionSyncMessage)
}

export function notifyMessagesChanged(dashboardId: string, sessionId: string): void {
  getSyncChannel().postMessage({
    type: 'messages-changed',
    dashboardId,
    sessionId,
  } satisfies SessionSyncMessage)
}

export function subscribeAgentSessionSync(
  handler: (message: SessionSyncMessage) => void,
): () => void {
  const channel = getSyncChannel()
  const listener = (event: MessageEvent<SessionSyncMessage>) => {
    const data = event.data
    if (!data?.dashboardId) return

    if (data.type === 'session-changed') {
      activeSessionByDashboard.set(data.dashboardId, data.sessionId)
    }

    handler(data)
  }

  channel.addEventListener('message', listener)
  return () => channel.removeEventListener('message', listener)
}
