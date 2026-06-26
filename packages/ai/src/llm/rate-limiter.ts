/** Simple token-bucket rate limiter for LLM requests. */
export class RateLimiter {
  private tokens: number
  private lastRefill: number

  constructor(
    private readonly maxTokens: number,
    private readonly refillRatePerSec: number,
  ) {
    this.tokens = maxTokens
    this.lastRefill = Date.now()
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRatePerSec)
    this.lastRefill = now
  }

  async acquire(): Promise<void> {
    this.refill()
    if (this.tokens >= 1) {
      this.tokens -= 1
      return
    }
    const waitMs = ((1 - this.tokens) / this.refillRatePerSec) * 1000
    await new Promise((resolve) => setTimeout(resolve, Math.ceil(waitMs)))
    this.refill()
    this.tokens = Math.max(0, this.tokens - 1)
  }
}

/** Default: 10 requests burst, 2 req/s sustained. */
export const defaultRateLimiter = new RateLimiter(10, 2)
