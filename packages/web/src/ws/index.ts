import {
  AGENT_EVENTS,
  BI_AGENT_NAMESPACE,
  DEFAULT_WS_URL,
  WS_BROADCAST_CHANNEL,
  WS_SHARED_WORKER_NAME,
} from './constants'
import {
  getInflightJoinRooms,
  getLastJoinedRooms,
  joinRoomsKey,
  resetBiAgentJoinState,
  setInflightJoinRooms,
  setLastJoinedRooms,
} from './join-state'
import { bindDashboardWsLifecycle } from './lifecycle'
import type { AckResponse, AgentMessageDto, ConnectionStatus, MessageSendPayload, RoomJoinPayload } from './protocol'
import { getWsClient } from './ws-client'

export {
  AGENT_EVENTS,
  BI_AGENT_NAMESPACE,
  DEFAULT_WS_URL,
  WS_BROADCAST_CHANNEL,
  WS_SHARED_WORKER_NAME,
} from './constants'

export {
  archiveAgentSession,
  createAgentSession,
  ensureAgentSession,
  getAgentSession,
  listAgentSessions,
  loadAgentMessages,
  renameAgentSession,
} from './agent-http'

export {
  getActiveSessionId,
  notifyMessagesChanged,
  setActiveSessionId,
  subscribeAgentSessionSync,
} from './agent-session-sync'
export type { SessionSyncMessage } from './agent-session-sync'

export type {
  AckResponse,
  AgentErrorPayload,
  AgentMessageDto,
  AgentSessionDto,
  ConnectionStatus,
  EmitPayload,
  MessageSendPayload,
  MessageStreamPayload,
  RoomJoinPayload,
} from './protocol'

export { BlocksBiWsClient, getWsClient } from './ws-client'
export { bindDashboardWsLifecycle } from './lifecycle'
export { resetBiAgentJoinState } from './join-state'

export async function connectWs(url = DEFAULT_WS_URL): Promise<ConnectionStatus> {
  const client = getWsClient()
  return client.connect({ url })
}

/** Connect to /bi-agent namespace via SharedWorker (deduped per tab). */
export async function connectBiAgent(url = DEFAULT_WS_URL): Promise<ConnectionStatus> {
  const client = getWsClient()
  return client.connect({ url, namespace: BI_AGENT_NAMESPACE })
}

/** Ensure bi-agent socket is connected. No-op if already connected or no dashboard consumer. */
export async function ensureBiAgentConnected(url = DEFAULT_WS_URL): Promise<ConnectionStatus> {
  const client = getWsClient()
  client.init()

  const status = await client.getStatus()
  if (status.connected && status.namespace === BI_AGENT_NAMESPACE) {
    return status
  }

  return connectBiAgent(url)
}

/** Join dashboard + session rooms. Dedupes identical joins; skips while connecting. */
export async function joinBiAgentRooms(payload: RoomJoinPayload): Promise<AckResponse> {
  const client = getWsClient()
  client.init()

  const status = await client.getStatus()
  if (!status.connected) {
    throw new Error('Socket is not connected — wait for connect before joining rooms')
  }

  const key = joinRoomsKey(payload)
  const lastJoined = getLastJoinedRooms()

  if (lastJoined && joinRoomsKey(lastJoined) === key) {
    return { ok: true }
  }

  const { promise: inflight, key: inflightKey } = getInflightJoinRooms()
  if (inflight && inflightKey === key) {
    return inflight as Promise<AckResponse>
  }

  if (lastJoined && joinRoomsKey(lastJoined) !== key) {
    setLastJoinedRooms(null)
  }

  const joinPromise = client
    .emitAgent<RoomJoinPayload>(AGENT_EVENTS.ROOM_JOIN, payload)
    .then((response) => {
      if (response.ok) {
        setLastJoinedRooms(payload)
      }
      return response
    })
    .finally(() => {
      setInflightJoinRooms(null, null)
    })

  setInflightJoinRooms(joinPromise, key)
  return joinPromise
}

export async function sendBiAgentMessage(
  payload: MessageSendPayload,
): Promise<AckResponse<AgentMessageDto>> {
  const client = getWsClient()
  return client.emitAgent<MessageSendPayload, AgentMessageDto>(
    AGENT_EVENTS.MESSAGE_SEND,
    payload,
  )
}

export async function cancelBiAgentRun(sessionId: string): Promise<AckResponse> {
  const client = getWsClient()
  return client.emitAgent<{ sessionId: string }>(AGENT_EVENTS.MESSAGE_CANCEL, { sessionId })
}

export { AGENT_EVENTS as AgentEvents }
