import type { TokenUsage } from './index'

/** Agent loop → transport layer (WebSocket / HTTP) callbacks. */
export interface BiAgentCallbacks {
  /** Stream assistant text to the client. */
  onTextDelta: (text: string) => void
  /** Notify client that a tool call is starting. */
  onToolCall: (toolCallId: string, toolName: string, input: Record<string, unknown>) => void
  /** Stream intermediate progress while a remote tool runs. */
  onToolProgress: (toolCallId: string, message: string) => void
  /** Deliver the final tool result string to the client UI. */
  onToolResult: (toolCallId: string, result: string, isError?: boolean) => void
  /** Token usage update after each LLM turn. */
  onUsageUpdate: (usage: TokenUsage) => void
  /** Context was compressed — informational for the UI. */
  onContextCompressed?: (message: string) => void
  /** Model was switched mid-session (invalidates prompt cache). */
  onModelSwitch?: (modelId: string, previousModelId: string) => void
  /** Unrecoverable error — loop will stop. */
  onError: (error: Error) => void
}
