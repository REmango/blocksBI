import { validate as validateUuid, v4 as uuidv4 } from 'uuid'

export function createSessionId(): string {
  return uuidv4()
}

export function assertSessionId(sessionId: string, field = 'sessionId'): string {
  if (!validateUuid(sessionId)) {
    throw new Error(`Invalid ${field}`)
  }
  return sessionId
}
