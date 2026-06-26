import { useEffect, useRef, useState } from 'react'
import { Button, Dropdown, Input, Tag, Tooltip } from 'antd'
import type { InputRef } from 'antd/es/input'
import type { MenuProps } from 'antd'
import {
  CloseOutlined,
  DeleteOutlined,
  InboxOutlined,
  MenuFoldOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'

import type { AgentSessionDto } from '@/ws'

import type { AiAssistantStatus } from './types'

const STATUS_CONFIG: Record<
  AiAssistantStatus,
  { label: string; color: 'default' | 'processing' | 'warning' }
> = {
  idle: { label: '空闲', color: 'default' },
  thinking: { label: '思考中', color: 'processing' },
  'tool-running': { label: '工具执行中', color: 'warning' },
}

interface SessionHeaderProps {
  sessionName: string
  canvasName: string
  status: AiAssistantStatus
  currentSessionId: string
  sessionList: AgentSessionDto[]
  onLoadSessionList: () => void
  onSwitchSession: (sessionId: string) => void
  onNewConversation: () => void
  onClearContext: () => void
  onArchiveSession: () => void
  onRenameSessionTitle: (title: string) => void
  onCollapse: () => void
  onClose: () => void
}

const SessionHeader = ({
  sessionName,
  canvasName,
  status,
  currentSessionId,
  sessionList,
  onLoadSessionList,
  onSwitchSession,
  onNewConversation,
  onClearContext,
  onArchiveSession,
  onRenameSessionTitle,
  onCollapse,
  onClose,
}: SessionHeaderProps) => {
  const statusConfig = STATUS_CONFIG[status]
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(sessionName)
  const inputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (!isEditing) {
      setEditValue(sessionName)
    }
  }, [sessionName, isEditing])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const commitRename = () => {
    const trimmed = editValue.trim()
    setIsEditing(false)

    if (trimmed && trimmed !== sessionName) {
      onRenameSessionTitle(trimmed)
      return
    }

    setEditValue(sessionName)
  }

  const cancelRename = () => {
    setEditValue(sessionName)
    setIsEditing(false)
  }

  const sessionMenuItems: MenuProps['items'] =
    sessionList.length > 0
      ? sessionList.map((item) => ({
          key: item.sessionId,
          label: (
            <div className="ai-assistant-session-item">
              <span className="ai-assistant-session-item-title">{item.sessionTitle}</span>
              {item.sessionId === currentSessionId ? (
                <span className="ai-assistant-session-item-badge">当前</span>
              ) : null}
            </div>
          ),
          className:
            item.sessionId === currentSessionId
              ? 'ai-assistant-session-item-active'
              : undefined,
        }))
      : [{ key: 'empty', label: '暂无会话', disabled: true }]

  const handleSessionMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'empty' || key === currentSessionId) return
    onSwitchSession(String(key))
  }

  return (
    <div className="ai-assistant-session-header shrink-0 border-b border-[#334155] px-3 py-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <Input
              ref={inputRef}
              size="small"
              value={editValue}
              maxLength={50}
              className="ai-assistant-session-title-input"
              onChange={(event) => setEditValue(event.target.value)}
              onBlur={commitRename}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitRename()
                } else if (event.key === 'Escape') {
                  event.preventDefault()
                  cancelRename()
                }
              }}
            />
          ) : (
            <div
              className="cursor-pointer truncate text-sm font-medium text-[#e5e7eb] hover:text-white"
              title="点击重命名"
              onClick={() => setIsEditing(true)}
            >
              {sessionName}
            </div>
          )}
          <div className="mt-1 truncate text-xs text-[#94a3b8]">{canvasName}</div>
        </div>
        <Tag color={statusConfig.color} className="m-0 shrink-0">
          {statusConfig.label}
        </Tag>
      </div>

      <div className="flex items-center justify-end gap-1">
        <Dropdown
          menu={{
            className: 'ai-assistant-session-menu',
            items: sessionMenuItems,
            onClick: handleSessionMenuClick,
          }}
          trigger={['click']}
          overlayClassName="ai-assistant-session-dropdown"
          placement="bottomRight"
          onOpenChange={(open) => {
            if (open) onLoadSessionList()
          }}
        >
          <Tooltip title="切换会话">
            <Button
              type="text"
              size="small"
              icon={<UnorderedListOutlined />}
              className="ai-assistant-icon-btn"
            />
          </Tooltip>
        </Dropdown>
        <Tooltip title="新建对话">
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            className="ai-assistant-icon-btn"
            onClick={onNewConversation}
          />
        </Tooltip>
        <Tooltip title="清空上下文">
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            className="ai-assistant-icon-btn"
            onClick={onClearContext}
          />
        </Tooltip>
        <Tooltip title="会话归档">
          <Button
            type="text"
            size="small"
            icon={<InboxOutlined />}
            className="ai-assistant-icon-btn"
            onClick={onArchiveSession}
          />
        </Tooltip>
        <Tooltip title="收起面板">
          <Button
            type="text"
            size="small"
            icon={<MenuFoldOutlined />}
            className="ai-assistant-icon-btn"
            onClick={onCollapse}
          />
        </Tooltip>
        <Tooltip title="关闭">
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            className="ai-assistant-icon-btn"
            onClick={onClose}
          />
        </Tooltip>
      </div>
    </div>
  )
}

export default SessionHeader
