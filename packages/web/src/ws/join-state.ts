import type { RoomJoinPayload } from './protocol'

let lastJoinedRooms: RoomJoinPayload | null = null
let inflightJoinRooms: Promise<unknown> | null = null
let inflightJoinRoomsKey: string | null = null

export function joinRoomsKey(payload: RoomJoinPayload): string {
  return `${payload.dashboardId}:${payload.sessionId}`
}

export function getLastJoinedRooms(): RoomJoinPayload | null {
  return lastJoinedRooms
}

export function setLastJoinedRooms(payload: RoomJoinPayload | null): void {
  lastJoinedRooms = payload
}

export function getInflightJoinRooms(): {
  promise: Promise<unknown> | null
  key: string | null
} {
  return { promise: inflightJoinRooms, key: inflightJoinRoomsKey }
}

export function setInflightJoinRooms(
  promise: Promise<unknown> | null,
  key: string | null,
): void {
  inflightJoinRooms = promise
  inflightJoinRoomsKey = key
}

/** Clear room join dedupe cache (call on disconnect / route leave). */
export function resetBiAgentJoinState(): void {
  lastJoinedRooms = null
  inflightJoinRooms = null
  inflightJoinRoomsKey = null
}
