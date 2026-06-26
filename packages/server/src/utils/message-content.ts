/** Max chars persisted / returned for a single agent chat message. */
export const MAX_MESSAGE_CONTENT_CHARS = 128_000

export function truncateMessageContent(content: string): string {
  if (content.length <= MAX_MESSAGE_CONTENT_CHARS) {
    return content
  }
  return (
    content.slice(0, MAX_MESSAGE_CONTENT_CHARS) +
    '\n\n[消息内容过长，已截断]'
  )
}
