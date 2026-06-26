import { useRef } from 'react'
import { Button, Input, Space } from 'antd'
import { AppstoreOutlined, SendOutlined, StopOutlined } from '@ant-design/icons'

import { QUICK_COMMANDS } from './useAiAssistantSession'
import type { QuickCommand } from './types'

const { TextArea } = Input

interface InputAreaProps {
  inputValue: string
  isStreaming: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onStop: () => void
  onQuickCommand: (command: QuickCommand) => void
  onReferenceComponent: () => void
}

const InputArea = ({
  inputValue,
  isStreaming,
  onInputChange,
  onSend,
  onStop,
  onQuickCommand,
  onReferenceComponent,
}: InputAreaProps) => {
  const textareaRef = useRef<React.ComponentRef<typeof TextArea>>(null)
  const canSend = inputValue.trim().length > 0 && !isStreaming

  const focusTextarea = () => {
    textareaRef.current?.focus()
  }

  const handleSend = () => {
    if (!canSend) return
    onSend()
    queueMicrotask(focusTextarea)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ai-assistant-input-area shrink-0 border-t border-[#334155] px-3 py-3">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {QUICK_COMMANDS.map((command) => (
          <Button
            key={command.label}
            size="small"
            className="ai-assistant-chip-btn"
            onClick={() => onQuickCommand(command)}
          >
            {command.label}
          </Button>
        ))}
        <Button
          size="small"
          icon={<AppstoreOutlined />}
          className="ai-assistant-chip-btn"
          onClick={onReferenceComponent}
        >
          引用组件
        </Button>
      </div>

      <TextArea
        ref={textareaRef}
        value={inputValue}
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入问题，Enter 发送，Shift + Enter 换行"
        autoSize={{ minRows: 3, maxRows: 6 }}
        className="ai-assistant-textarea"
      />

      <div className="mt-2 flex items-center justify-end">
        <Space size={8}>
          {isStreaming ? (
            <Button
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={onStop}
            >
              停止
            </Button>
          ) : null}
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            className="ai-assistant-send-btn"
            disabled={!canSend}
            onClick={handleSend}
          >
            发送
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default InputArea
