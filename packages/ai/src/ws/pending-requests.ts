import type { RemoteToolAck } from './types'

export interface PendingRequestEntry {
  requestId: string
  sessionId: string
  toolName: string
  createdAt: number
  resolve: (ack: RemoteToolAck) => void
  reject: (err: Error) => void
  timer: ReturnType<typeof setTimeout>
}

/** In-memory requestId → pending promise map for WS ACK routing. */
export class PendingRequestRegistry {
  private readonly pending = new Map<string, PendingRequestEntry>()
  private readonly bySession = new Map<string, Set<string>>()

  register(
    entry: Omit<PendingRequestEntry, 'resolve' | 'reject' | 'timer'>,
    timeoutMs: number,
  ): Promise<RemoteToolAck> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.remove(entry.requestId)
        reject(new Error(`Remote tool "${entry.toolName}" timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      this.pending.set(entry.requestId, { ...entry, resolve, reject, timer })

      let sessionSet = this.bySession.get(entry.sessionId)
      if (!sessionSet) {
        sessionSet = new Set()
        this.bySession.set(entry.sessionId, sessionSet)
      }
      sessionSet.add(entry.requestId)
    })
  }

  resolve(requestId: string, ack: RemoteToolAck): boolean {
    const entry = this.pending.get(requestId)
    if (!entry) return false
    this.remove(requestId)
    entry.resolve(ack)
    return true
  }

  reject(requestId: string, error: Error): boolean {
    const entry = this.pending.get(requestId)
    if (!entry) return false
    this.remove(requestId)
    entry.reject(error)
    return true
  }

  cancelSession(sessionId: string, reason = 'Session closed'): number {
    const ids = this.bySession.get(sessionId)
    if (!ids) return 0
    let count = 0
    for (const requestId of [...ids]) {
      if (this.reject(requestId, new Error(reason))) count++
    }
    return count
  }

  cancelAll(reason = 'Server shutdown'): void {
    for (const requestId of [...this.pending.keys()]) {
      this.reject(requestId, new Error(reason))
    }
  }

  size(): number {
    return this.pending.size
  }

  sessionSize(sessionId: string): number {
    return this.bySession.get(sessionId)?.size ?? 0
  }

  private remove(requestId: string): void {
    const entry = this.pending.get(requestId)
    if (!entry) return
    clearTimeout(entry.timer)
    this.pending.delete(requestId)
    const sessionSet = this.bySession.get(entry.sessionId)
    sessionSet?.delete(requestId)
    if (sessionSet?.size === 0) {
      this.bySession.delete(entry.sessionId)
    }
  }
}
