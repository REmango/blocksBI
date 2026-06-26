import { useEffect, useRef } from 'react'
import { RobotOutlined, UserOutlined } from '@ant-design/icons'
import { Spin } from 'antd'

import { StreamingMarkdown } from './markdown'
import type { ChatMessage } from './types'

interface MessageListProps {
  messages: ChatMessage[]
  loading?: boolean
  isStreaming?: boolean
  streamingMessageId?: string | null
}

const MessageList = ({
  messages,
  loading = false,
  isStreaming = false,
  streamingMessageId = null,
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [messages])

  return (
    <div ref={scrollRef} className="ai-assistant-message-list flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <Spin size="small" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center text-xs text-[#64748b]">
          <RobotOutlined className="mb-2 text-2xl text-[#475569]" />
          <div>开始与 AI 助手对话</div>
          <div className="mt-1">可询问画布分析、布局优化或组件说明</div>
        </div>
      ) : (
        <div className="flex min-w-0 w-full flex-col gap-3">
          {messages.map((item) => {
            const isUser = item.role === 'user'
            const isActiveStream = isStreaming && item.id === streamingMessageId

            return (
              <div
                key={item.id}
                className={
                  isUser
                    ? 'ai-assistant-message-row ai-assistant-message-row--user'
                    : 'ai-assistant-message-row ai-assistant-message-row--assistant'
                }
              >
                <div
                  className={`ai-assistant-message-avatar mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    isUser ? 'bg-[#2563eb]' : 'bg-[#334155]'
                  }`}
                >
                  {isUser ? (
                    <UserOutlined className="text-xs text-white" />
                  ) : (
                    <RobotOutlined className="text-xs text-[#e5e7eb]" />
                  )}
                </div>
                <div
                  className={`ai-assistant-message-bubble rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#2563eb] text-white'
                      : 'border border-[#334155] bg-[#1e2122] text-[#e5e7eb]'
                  }`}
                >
                  {isUser ? (
                    item.content
                  ) : (
                    <StreamingMarkdown content={item.content} streaming={isActiveStream} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MessageList
