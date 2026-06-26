import SessionHeader from './SessionHeader'
import MessageList from './MessageList'
import InputArea from './InputArea'
import { useAiAssistantSession } from './useAiAssistantSession'

interface AiAssistantPanelProps {
  active: boolean
  onClose: () => void
}

const AiAssistantPanel = ({ active, onClose }: AiAssistantPanelProps) => {
  const {
    sessionName,
    canvasName,
    currentSessionId,
    sessionList,
    messages,
    status,
    inputValue,
    isStreaming,
    streamingMessageId,
    isInitializing,
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
  } = useAiAssistantSession(active)

  if (!dashboardId) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-gray-500">
        请通过 /:dashboardId 路由访问以启用 AI 助手
      </div>
    )
  }

  return (
    <div className="ai-assistant-panel flex h-full min-w-0 w-full flex-col overflow-hidden">
      <SessionHeader
        sessionName={sessionName}
        canvasName={canvasName}
        status={status}
        currentSessionId={currentSessionId}
        sessionList={sessionList}
        onLoadSessionList={() => void loadSessionList()}
        onSwitchSession={(sessionId) => void handleSwitchSession(sessionId)}
        onNewConversation={handleNewConversation}
        onClearContext={handleClearContext}
        onArchiveSession={handleArchiveSession}
        onRenameSessionTitle={(title) => void handleRenameSessionTitle(title)}
        onCollapse={onClose}
        onClose={onClose}
      />
      <MessageList
        messages={messages}
        loading={isInitializing}
        isStreaming={isStreaming}
        streamingMessageId={streamingMessageId}
      />
      <InputArea
        inputValue={inputValue}
        isStreaming={isStreaming || isInitializing}
        onInputChange={setInputValue}
        onSend={() => void sendMessage(inputValue)}
        onStop={stopStreaming}
        onQuickCommand={handleQuickCommand}
        onReferenceComponent={handleReferenceCanvasComponent}
      />
    </div>
  )
}

export default AiAssistantPanel
