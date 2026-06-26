import { DEFAULT_API_URL } from './constants'
import { setActiveSessionId } from './agent-session-sync'
import type { AgentMessageDto, AgentSessionDto } from './protocol'

interface ApiResponse<T> {
  ok: boolean
  data?: T
  message?: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${DEFAULT_API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  let body: ApiResponse<T>
  try {
    body = (await response.json()) as ApiResponse<T>
  } catch {
    throw new Error(`Request failed: ${path}`)
  }

  if (!response.ok || !body.ok || !body.data) {
    throw new Error(body.message ?? `Request failed: ${path}`)
  }

  return body.data
}

const inflightGetSession = new Map<string, Promise<AgentSessionDto>>()
const inflightEnsureSession = new Map<string, Promise<AgentSessionDto>>()
const inflightLoadMessages = new Map<string, Promise<AgentMessageDto[]>>()

function dedupeRequest<T>(key: string, store: Map<string, Promise<T>>, run: () => Promise<T>): Promise<T> {
  const existing = store.get(key)
  if (existing) return existing

  const promise = run().finally(() => {
    store.delete(key)
  })
  store.set(key, promise)
  return promise
}

export async function createAgentSession(
  dashboardId: string,
  sessionTitle = '新会话',
): Promise<AgentSessionDto> {
  return request<AgentSessionDto>('/api/bi-agent/sessions', {
    method: 'POST',
    body: JSON.stringify({ dashboardId, sessionTitle }),
  })
}

export async function listAgentSessions(dashboardId: string): Promise<AgentSessionDto[]> {
  const query = new URLSearchParams({ dashboardId, status: 'active' })
  return request<AgentSessionDto[]>(`/api/bi-agent/sessions?${query.toString()}`)
}

export async function getAgentSession(sessionId: string): Promise<AgentSessionDto> {
  return dedupeRequest(`session:${sessionId}`, inflightGetSession, () =>
    request<AgentSessionDto>(`/api/bi-agent/sessions/${sessionId}`),
  )
}

export async function loadAgentMessages(sessionId: string): Promise<AgentMessageDto[]> {
  return dedupeRequest(`messages:${sessionId}`, inflightLoadMessages, () =>
    request<AgentMessageDto[]>(`/api/bi-agent/sessions/${sessionId}/messages`),
  )
}

export async function archiveAgentSession(sessionId: string): Promise<AgentSessionDto> {
  return request<AgentSessionDto>(`/api/bi-agent/sessions/${sessionId}/archive`, {
    method: 'PATCH',
  })
}

export async function renameAgentSession(
  sessionId: string,
  sessionTitle: string,
): Promise<AgentSessionDto> {
  return request<AgentSessionDto>(`/api/bi-agent/sessions/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ sessionTitle }),
  })
}

/** Resolve active session from API (most recently updated); create when none exists. */
export async function ensureAgentSession(dashboardId: string): Promise<AgentSessionDto> {
  return dedupeRequest(`ensure:${dashboardId}`, inflightEnsureSession, async () => {
    const sessions = await listAgentSessions(dashboardId)
    const session =
      sessions.length > 0 ? sessions[0] : await createAgentSession(dashboardId, '新会话')

    setActiveSessionId(dashboardId, session.sessionId)
    return session
  })
}
