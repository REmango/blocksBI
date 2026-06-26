import { useCallback, useEffect, useRef, useState } from 'react'
import { message } from 'antd'
import { useParams } from 'react-router'

import useDashboardStore from '@/store/useDashboardStore'
import {
  AGENT_EVENTS,
  archiveAgentSession,
  cancelBiAgentRun,
  createAgentSession,
  ensureAgentSession,
  getAgentSession,
  getWsClient,
  joinBiAgentRooms,
  listAgentSessions,
  loadAgentMessages,
  notifyMessagesChanged,
  renameAgentSession,
  sendBiAgentMessage,
  setActiveSessionId,
  subscribeAgentSessionSync,
} from '@/ws'
import type { AgentMessageDto, AgentSessionDto, MessageStreamPayload } from '@/ws'

import type { AiAssistantStatus, ChatMessage, QuickCommand } from './types'

export const QUICK_COMMANDS: QuickCommand[] = [
  { label: '分析画布', text: '请分析当前画布的整体布局与数据展示是否合理。' },
  { label: '优化建议', text: '请给出当前画布的优化建议。' },
  { label: '组件说明', text: '请解释当前选中组件的数据含义与展示方式。' },
]

function toChatMessage(dto: AgentMessageDto): ChatMessage {
  return {
    id: dto.id,
    role: dto.role === 'user' ? 'user' : 'assistant',
    content: dto.content,
    createdAt: new Date(dto.createdAt).getTime(),
  }
}

export function useAiAssistantSession(active: boolean) {
  const { dashboardId } = useParams<{ dashboardId: string }>()
  const dashboardName = useDashboardStore((state) => state.dashboardName)
  const currentPageIndex = useDashboardStore((state) => state.currentPageIndex)
  const pageNames = useDashboardStore((state) => state.pageNames)
  const currentEditingCardId = useDashboardStore((state) => state.currentEditingCardId)
  const cardMap = useDashboardStore((state) => state.cardMap)

  const [session, setSession] = useState<AgentSessionDto | null>(null)
  const [sessionList, setSessionList] = useState<AgentSessionDto[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<AiAssistantStatus>('idle')
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  const sessionRef = useRef<AgentSessionDto | null>(null)
  const setupInProgressRef = useRef<string | null>(null)
  const messagesReloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dashboardIdRef = useRef<string | undefined>(dashboardId)
  const streamingMessageIdRef = useRef<string | null>(null)
  const lastStreamAtRef = useRef(0)
  const streamDoneGraceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(active)

  dashboardIdRef.current = dashboardId
  activeRef.current = active

  const syncStreamingMessageId = useCallback((messageId: string | null) => {
    streamingMessageIdRef.current = messageId
    setStreamingMessageId(messageId)
  }, [])

  const canvasName = pageNames[currentPageIndex]
    ? `${dashboardName} / ${pageNames[currentPageIndex]}`
    : dashboardName

  const sessionName = session?.sessionTitle ?? '新会话'

  const resetStreamingState = useCallback(() => {
    if (streamDoneGraceTimerRef.current) {
      clearTimeout(streamDoneGraceTimerRef.current)
      streamDoneGraceTimerRef.current = null
    }
    setIsStreaming(false)
    setStatus('idle')
    syncStreamingMessageId(null)
  }, [syncStreamingMessageId])

  const setupSession = useCallback(
    async (nextSession: AgentSessionDto) => {
      if (!dashboardId) return
      if (setupInProgressRef.current === nextSession.sessionId) return

      setupInProgressRef.current = nextSession.sessionId
      sessionRef.current = nextSession
      setSession(nextSession)
      setActiveSessionId(dashboardId, nextSession.sessionId)

      try {
        await joinBiAgentRooms({
          dashboardId,
          sessionId: nextSession.sessionId,
        })

        try {
          const history = await loadAgentMessages(nextSession.sessionId)
          setMessages(history.map(toChatMessage))
        } catch (error) {
          console.error('[ai-assistant] failed to load messages:', error)
          setMessages([])
        }
      } finally {
        if (setupInProgressRef.current === nextSession.sessionId) {
          setupInProgressRef.current = null
        }
      }
    },
    [dashboardId],
  )

  // WS push listeners — bound once per dashboardId; drawer open/close does not re-bind
  useEffect(() => {
    if (!dashboardId) return

    const ws = getWsClient()
    ws.init()

    const unsubConn = ws.onConnectionChange((status) => {
      if (!status.connected) {
        resetStreamingState()
        setIsInitializing(false)
      }
    })

    const unsubReceived = ws.on<AgentMessageDto>(AGENT_EVENTS.MESSAGE_RECEIVED, (payload) => {
      if (payload.sessionId !== sessionRef.current?.sessionId) return
      if (payload.role !== 'user') return

      setMessages((prev) => {
        if (prev.some((item) => item.id === payload.id)) return prev
        return [...prev, toChatMessage(payload)]
      })
    })

    const unsubStream = ws.on<MessageStreamPayload>(AGENT_EVENTS.MESSAGE_STREAM, (payload) => {
      if (payload.sessionId !== sessionRef.current?.sessionId) return

      lastStreamAtRef.current = Date.now()
      syncStreamingMessageId(payload.messageId)
      setStatus('thinking')
      setIsStreaming(true)

      if (streamDoneGraceTimerRef.current) {
        clearTimeout(streamDoneGraceTimerRef.current)
        streamDoneGraceTimerRef.current = null
      }

      setMessages((prev) => {
        const exists = prev.some((item) => item.id === payload.messageId)
        if (exists) {
          return prev.map((item) =>
            item.id === payload.messageId ? { ...item, content: payload.chunk } : item,
          )
        }
        return [
          ...prev,
          {
            id: payload.messageId,
            role: 'assistant',
            content: payload.chunk,
            createdAt: Date.now(),
          },
        ]
      })

      if (payload.done) {
        streamDoneGraceTimerRef.current = setTimeout(() => {
          resetStreamingState()
        }, 5000)
      }
    })

    const unsubComplete = ws.on<AgentMessageDto>(AGENT_EVENTS.MESSAGE_COMPLETE, (payload) => {
      if (payload.sessionId !== sessionRef.current?.sessionId) return

      setMessages((prev) => {
        const exists = prev.some((item) => item.id === payload.id)
        if (exists) {
          return prev.map((item) =>
            item.id === payload.id ? toChatMessage(payload) : item,
          )
        }
        return [...prev, toChatMessage(payload)]
      })

      setIsStreaming(false)
      setStatus('idle')
      syncStreamingMessageId(null)

      if (streamDoneGraceTimerRef.current) {
        clearTimeout(streamDoneGraceTimerRef.current)
        streamDoneGraceTimerRef.current = null
      }

      const currentDashboardId = dashboardIdRef.current
      if (currentDashboardId) {
        notifyMessagesChanged(currentDashboardId, payload.sessionId)
      }
    })

    const unsubError = ws.on<{ code: string; message: string }>(AGENT_EVENTS.ERROR, (payload) => {
      if (activeRef.current) {
        message.error(payload.message)
      }
      resetStreamingState()
    })

    const streamWatchdog = window.setInterval(() => {
      if (!streamingMessageIdRef.current) return
      if (Date.now() - lastStreamAtRef.current < 120_000) return
      resetStreamingState()
      if (activeRef.current) {
        message.warning('AI 响应超时，已自动停止等待')
      }
    }, 5000)

    return () => {
      unsubConn()
      unsubReceived()
      unsubStream()
      unsubComplete()
      unsubError()
      window.clearInterval(streamWatchdog)
      if (streamDoneGraceTimerRef.current) {
        clearTimeout(streamDoneGraceTimerRef.current)
        streamDoneGraceTimerRef.current = null
      }
    }
  }, [dashboardId, resetStreamingState, syncStreamingMessageId])

  // Session init from HTTP + cross-tab runtime sync via BroadcastChannel
  useEffect(() => {
    if (!dashboardId) return

    let cancelled = false

    const unsubSync = subscribeAgentSessionSync((syncMessage) => {
      if (syncMessage.dashboardId !== dashboardId || cancelled) return

      if (syncMessage.type === 'session-changed') {
        if (sessionRef.current?.sessionId === syncMessage.sessionId) return
        if (setupInProgressRef.current === syncMessage.sessionId) return

        void getAgentSession(syncMessage.sessionId)
          .then((nextSession) => setupSession(nextSession))
          .catch(() => undefined)
        return
      }

      if (syncMessage.type === 'messages-changed') {
        if (sessionRef.current?.sessionId !== syncMessage.sessionId) return

        if (messagesReloadTimerRef.current) {
          clearTimeout(messagesReloadTimerRef.current)
        }
        messagesReloadTimerRef.current = setTimeout(() => {
          messagesReloadTimerRef.current = null
          void loadAgentMessages(syncMessage.sessionId)
            .then((history) => {
              if (cancelled) return
              setMessages(history.map(toChatMessage))
              setIsStreaming(false)
              setStatus('idle')
            })
            .catch(() => undefined)
        }, 300)
      }
    })

    return () => {
      cancelled = true
      if (messagesReloadTimerRef.current) {
        clearTimeout(messagesReloadTimerRef.current)
        messagesReloadTimerRef.current = null
      }
      unsubSync()
    }
  }, [dashboardId, setupSession])

  // Load session from HTTP when drawer opens; closing drawer does not disconnect WS
  useEffect(() => {
    if (!dashboardId || !active) return
    if (sessionRef.current) return

    let cancelled = false

    void (async () => {
      setIsInitializing(true)
      try {
        const nextSession = await ensureAgentSession(dashboardId)
        if (cancelled) return
        await setupSession(nextSession)
      } catch (error) {
        if (!cancelled) {
          message.error(error instanceof Error ? error.message : 'Agent 初始化失败')
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [dashboardId, active, setupSession])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      const currentSession = sessionRef.current
      if (!trimmed || isStreaming || !currentSession) return

      setInputValue('')
      setStatus('thinking')
      setIsStreaming(true)
      lastStreamAtRef.current = Date.now()

      try {
        const response = await sendBiAgentMessage({
          sessionId: currentSession.sessionId,
          content: trimmed,
        })

        if (!response.ok) {
          throw new Error(response.error?.message ?? '发送失败')
        }
      } catch (error) {
        setIsStreaming(false)
        setStatus('idle')
        message.error(error instanceof Error ? error.message : '发送失败')
      }
    },
    [isStreaming],
  )

  const handleNewConversation = useCallback(async () => {
    if (!dashboardId) {
      message.warning('缺少 dashboardId，请通过 /:dashboardId 路由访问')
      return
    }

    try {
      setIsStreaming(false)
      setStatus('idle')
      syncStreamingMessageId(null)

      const nextSession = await createAgentSession(dashboardId, '新会话')
      await setupSession(nextSession)
      setSessionList((prev) => [nextSession, ...prev.filter((item) => item.sessionId !== nextSession.sessionId)])
    } catch (error) {
      message.error(error instanceof Error ? error.message : '创建会话失败')
    }
  }, [dashboardId, setupSession])

  const handleClearContext = useCallback(() => {
    setMessages([])
    setInputValue('')
    setStatus('idle')
    setIsStreaming(false)
    syncStreamingMessageId(null)
    message.success('上下文已清空')
  }, [])

  const handleArchiveSession = useCallback(async () => {
    const currentSession = sessionRef.current
    if (!currentSession || !dashboardId) return

    try {
      await archiveAgentSession(currentSession.sessionId)
      message.success('会话已归档')

      setIsStreaming(false)
      setStatus('idle')
      syncStreamingMessageId(null)

      const nextSession = await createAgentSession(dashboardId, '新会话')
      await setupSession(nextSession)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '归档失败')
    }
  }, [dashboardId, setupSession])

  const handleRenameSessionTitle = useCallback(async (title: string) => {
    const currentSession = sessionRef.current
    if (!currentSession) return

    const trimmed = title.trim()
    if (!trimmed || trimmed === currentSession.sessionTitle) return

    try {
      const updated = await renameAgentSession(currentSession.sessionId, trimmed)
      sessionRef.current = updated
      setSession(updated)
      setSessionList((prev) =>
        prev.map((item) => (item.sessionId === updated.sessionId ? updated : item)),
      )
    } catch (error) {
      message.error(error instanceof Error ? error.message : '重命名失败')
    }
  }, [])

  const loadSessionList = useCallback(async () => {
    if (!dashboardId) return

    try {
      const sessions = await listAgentSessions(dashboardId)
      setSessionList(sessions)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载会话列表失败')
    }
  }, [dashboardId])

  const handleSwitchSession = useCallback(
    async (sessionId: string) => {
      if (!dashboardId) return
      if (sessionRef.current?.sessionId === sessionId) return

      try {
        setIsStreaming(false)
        setStatus('idle')
        syncStreamingMessageId(null)
        setInputValue('')

        const nextSession = await getAgentSession(sessionId)
        await setupSession(nextSession)
      } catch (error) {
        message.error(error instanceof Error ? error.message : '切换会话失败')
      }
    },
    [dashboardId, setupSession],
  )

  const handleQuickCommand = useCallback((command: QuickCommand) => {
    setInputValue(command.text)
  }, [])

  const handleReferenceCanvasComponent = useCallback(() => {
    const card = currentEditingCardId ? cardMap[currentEditingCardId] : undefined
    if (!card) {
      message.warning('请先在画布中选中一个组件')
      return
    }

    const reference = `[组件: ${card.name || card.componentName}]`
    setInputValue((prev) => (prev ? `${prev}\n${reference}` : reference))
  }, [cardMap, currentEditingCardId])

  const stopStreaming = useCallback(() => {
    const currentSession = sessionRef.current
    if (currentSession) {
      void cancelBiAgentRun(currentSession.sessionId).catch(() => undefined)
    }
    resetStreamingState()
  }, [resetStreamingState])

  return {
    sessionName,
    canvasName,
    currentSessionId: session?.sessionId ?? '',
    sessionList,
    messages,
    status,
    inputValue,
    isStreaming,
    streamingMessageId,
    isInitializing: active && isInitializing,
    dashboardId,
    setInputValue,
    sendMessage,
    stopStreaming,
    handleNewConversation,
    handleClearContext,
    handleArchiveSession,
    handleRenameSessionTitle,
    loadSessionList,
    handleSwitchSession,
    handleQuickCommand,
    handleReferenceCanvasComponent,
  }
}
