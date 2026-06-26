export type AiAssistantStatus = 'idle' | 'thinking' | 'tool-running'

export type ChatMessageRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string
  createdAt: number
}

export interface QuickCommand {
  label: string
  text: string
}
