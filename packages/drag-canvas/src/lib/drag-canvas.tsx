import React, { useState, useRef, useEffect, memo } from 'react'
import { DndContext, useDraggable, useDndContext } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { restrictToParentElement } from '@dnd-kit/modifiers'

import classNames from 'classnames'

import eventBus from './utils/eventBus'

import { addEvent, removeEvent, restrictToBounds } from './utils'

import './index.css'

interface Position {
  x: number
  y: number
}

interface DraggableItemProps {
  id: string
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  canvasWidth: number
  canvasHeight: number
  initialPosition?: Position
}

interface MouseDownClickPosition {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
  mouseX: number
  mouseY: number
}

interface ResizeLimit {
  minLeft: number | null
  maxLeft: number | null
  minTop: number | null
  maxTop: number | null
  minRight: number | null
  maxRight: number | null
  minBottom: number | null
  maxBottom: number | null
}

const handles = ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml']

const DraggableItem: React.FC<DraggableItemProps> = (props) => {
  const { id, maxWidth, maxHeight, canvasWidth, canvasHeight, initialPosition } = props
  const minWidth = props.minWidth || 10
  const minHeight = props.minHeight || 10

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  })

  const [width, setWidth] = useState(150)
  const [height, setHeight] = useState(150)

  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 })

  // 监听事件
  useEffect(() => {
    const cb = (data: { delta: { x: number; y: number } }) => {
      setPosition((prevPositions) => ({
        x: prevPositions.x + data.delta.x,
        y: prevPositions.y + data.delta.y,
      }))
    }
    eventBus.on(`${id}-dragEnd`, cb)

    return () => {
      eventBus.off(`${id}-dragEnd`, cb)
    }
  }, [])

  const mouseDownClickPosition = useRef<MouseDownClickPosition | null>(null)
  const resizeLimitsRef = useRef<ResizeLimit | null>(null)
  const isResizing = useRef(false)
  const handleRef = useRef<string>('')

  const style: React.CSSProperties = {
    position: 'absolute',
    top: position.y,
    left: position.x,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    // transition: transform ? 'transform 0.1s ease' : undefined,
    width: width,
    height: height,
    border: '1px solid black',
    backgroundColor: id === 'item1' ? 'red' : 'green',
  }

  const handleOnMouseDown = (handle: string, event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    // 只有鼠标左键按下时才触发
    if (event.button !== 0) {
      return
    }

    isResizing.current = true
    handleRef.current = handle

    mouseDownClickPosition.current = {
      left: position.x,
      top: position.y,
      right: canvasWidth - width - position.x, // 距离右边的位置
      bottom: canvasHeight - height - position.y, // 距离底部的位置
      width,
      height,
      mouseX: event.pageX,
      mouseY: event.pageY,
    }

    const bounds = calcResizeLimits()
    resizeLimitsRef.current = bounds

    addEvent(document.documentElement, 'mousemove', mouseMove)
    addEvent(document.documentElement, 'mouseup', mouseUp)
  }

  const mouseMove = (event: MouseEvent) => {
    // 如果鼠标没有按下，则不进行操作
    if (!isResizing.current) {
      return
    }

    // 获取当前位置
    let left = position.x
    let top = position.y
    let bottom = canvasHeight - height - top
    let right = canvasWidth - width - left

    const mouseClickPosition = mouseDownClickPosition.current as MouseDownClickPosition

    // 计算鼠标移动的距离
    const deltaX = mouseClickPosition.mouseX - event.pageX
    const deltaY = mouseClickPosition.mouseY - event.pageY

    console.log('deltaX', deltaX, deltaY)
    const curHandle = handleRef.current
    const bounds = resizeLimitsRef.current as ResizeLimit
    if (curHandle.includes('b')) {
      bottom = restrictToBounds(mouseClickPosition.bottom + deltaY, bounds.minBottom, bounds.maxBottom)
    }

    if (curHandle.includes('r')) {
      right = restrictToBounds(mouseClickPosition.right + deltaX, bounds.minRight, bounds.maxRight)
    }

    if (curHandle.includes('t')) {
      top = restrictToBounds(mouseClickPosition.top - deltaY, bounds.minTop, bounds.maxTop)
    }

    if (curHandle.includes('l')) {
      left = restrictToBounds(mouseClickPosition.left - deltaX, bounds.minLeft, bounds.maxLeft)
    }

    const newWidth = canvasWidth - left - right
    const newHeight = canvasHeight - top - bottom

    setWidth(newWidth)
    setHeight(newHeight)

    setPosition({
      x: left,
      y: top,
    })
  }

  const mouseUp = () => {
    if (isResizing.current) {
      isResizing.current = false
      resetBoundsAndMouseState()
      // 清除事件
      removeEvent(document.documentElement, 'mousemove', mouseMove)
      removeEvent(document.documentElement, 'mouseup', mouseUp)
    }
  }

  const resetBoundsAndMouseState = () => {
    mouseDownClickPosition.current = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      mouseX: 0,
      mouseY: 0,
    }

    resizeLimitsRef.current = null
  }

  const calcResizeLimits = (): ResizeLimit => {
    const resizeLimits: ResizeLimit = {
      minLeft: null,
      maxLeft: null,
      minTop: null,
      maxTop: null,
      minRight: null,
      maxRight: null,
      minBottom: null,
      maxBottom: null,
    }
    if (!mouseDownClickPosition.current) {
      return resizeLimits
    }

    const { left, top, right, bottom, width, height, mouseX, mouseY } = mouseDownClickPosition.current

    let maxW = maxWidth ?? canvasWidth
    let maxH = maxHeight ?? canvasHeight

    resizeLimits.minLeft = 0
    resizeLimits.maxLeft = left + Math.floor(width - minWidth)
    resizeLimits.minTop = 0
    resizeLimits.maxTop = top + Math.floor(height - minHeight)
    resizeLimits.minRight = 0
    resizeLimits.maxRight = right + Math.floor(width - minWidth)
    resizeLimits.minBottom = 0
    resizeLimits.maxBottom = bottom + Math.floor(height - minHeight)

    if (maxW) {
      resizeLimits.minLeft = Math.max(resizeLimits.minLeft, canvasWidth - right - maxW)
      resizeLimits.minRight = Math.max(resizeLimits.minRight, canvasWidth - left - maxW)
    }

    if (maxH) {
      resizeLimits.minTop = Math.max(resizeLimits.minTop, canvasHeight - bottom - maxH)
      resizeLimits.minBottom = Math.max(resizeLimits.minBottom, canvasHeight - top - maxH)
    }

    return resizeLimits
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {handles.map((handle) => (
        <div
          key={handle}
          className={classNames('handle', `handle-${handle}`)}
          onMouseDown={(event) => handleOnMouseDown(handle, event)}
          onPointerDown={(event) => {
            // 阻止默认的拖拽
            event.stopPropagation()
          }}
        />
      ))}
      Draggable Item {id}
    </div>
  )
}

const DraggableItemMemo = memo(DraggableItem)

const App: React.FC = () => {
  const handleDragEnd = (event: any) => {
    const { active, delta } = event
    const { id } = active

    // setPositions((prevPositions) => ({
    //   ...prevPositions,
    //   [id]: {
    //     x: prevPositions[id].x + delta.x,
    //     y: prevPositions[id].y + delta.y,
    //   },
    // }))

    const eventName = `${id}-dragEnd`

    eventBus.emit(eventName, { delta })
  }

  const canvasWidth = 1000
  const canvasHeight = 800

  return (
    <div
      style={{
        position: 'relative',
        width: canvasWidth,
        height: canvasHeight,
        border: '1px solid black',
      }}
    >
      <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
        <DraggableItemMemo
          id="item1"
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          initialPosition={{ x: 0, y: 0 }}
          minWidth={100}
          minHeight={100}
        />
        <DraggableItemMemo
          id="item2"
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          initialPosition={{ x: 100, y: 100 }}
          minWidth={100}
          minHeight={100}
        />
      </DndContext>
    </div>
  )
}

export default App
