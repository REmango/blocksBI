import { MouseEvent, ReactNode, useRef, useState } from 'react'

import CardFloatingActions from './CardFloatingActions'

interface CardContainerWrapperProps {
  children: ReactNode
}

const TOOLBAR_HIDE_DELAY_MS = 120

const CardContainerWrapper = ({ children }: CardContainerWrapperProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
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

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget
    if (
      relatedTarget instanceof Node &&
      wrapperRef.current?.contains(relatedTarget)
    ) {
      return
    }
    scheduleHideToolbar()
  }

  return (
    <div
      ref={wrapperRef}
      className="card-container-wrapper relative h-full w-full overflow-visible"
      onMouseEnter={showToolbar}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-toolbar-hover-zone">
        <CardFloatingActions visible={toolbarVisible} />
      </div>
      {children}
    </div>
  )
}

export default CardContainerWrapper
