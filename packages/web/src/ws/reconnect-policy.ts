const WINDOW_MS = 10_000
const MAX_ATTEMPTS = 5
const FREEZE_MS = 30_000

/** Limits handshake/reconnect bursts to avoid server rate limits. */
export class ReconnectRateLimiter {
  private attempts: number[] = []
  private frozenUntil = 0

  canAttempt(now = Date.now()): boolean {
    if (now < this.frozenUntil) {
      return false
    }

    this.attempts = this.attempts.filter((timestamp) => now - timestamp < WINDOW_MS)
    if (this.attempts.length >= MAX_ATTEMPTS) {
      this.frozenUntil = now + FREEZE_MS
      return false
    }

    this.attempts.push(now)
    return true
  }

  reset(): void {
    this.attempts = []
    this.frozenUntil = 0
  }

  isFrozen(now = Date.now()): boolean {
    return now < this.frozenUntil
  }
}

export const reconnectRateLimiter = new ReconnectRateLimiter()
