/** Drain a stream without processing — used on abort/error cleanup. */
export async function drainStream(stream: AsyncIterable<unknown>): Promise<void> {
  try {
    for await (const _ of stream) {
      // discard
    }
  } catch {
    // ignore drain errors
  }
}

import type { streamText } from 'ai'

export type StreamResult = Awaited<ReturnType<typeof streamText>>

export async function drainStreamResult(result: StreamResult): Promise<void> {
  await drainStream(result.fullStream)
}
