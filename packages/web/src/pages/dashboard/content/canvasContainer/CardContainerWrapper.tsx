import { ReactNode, useRef, useState } from 'react'

import CardFloatingActions from './CardFloatingActions'

interface CardContainerWrapperProps {
  children: ReactNode
}

const TOOLBAR_HIDE_DELAY_MS = 120

const CardContainerWrapper = ({ children }: CardContainerWrapperProps) => {
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const showToolbar = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = undefined
    }
    setToolbarVisible(true)
  }

  const scheduleHideToolbar = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
    }
    hideTimerRef.current = setTimeout(() => {
      setToolbarVisible(false)
      hideTimerRef.current = undefined
    }, TOOLBAR_HIDE_DELAY_MS)
  }

  return (
    <div
      className="card-container-wrapper relative h-full w-full overflow-visible"
      onMouseEnter={showToolbar}
      onMouseLeave={scheduleHideToolbar}
    >
      <div
        className="card-toolbar-hover-zone"
        style={{ pointerEvents: toolbarVisible ? 'auto' : 'none' }}
        onMouseEnter={showToolbar}
        onMouseLeave={scheduleHideToolbar}
      >
        <CardFloatingActions visible={toolbarVisible} />
      </div>
      {children}
    </div>
  )
}

export default CardContainerWrapper
