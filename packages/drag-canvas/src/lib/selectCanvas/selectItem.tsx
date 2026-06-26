// 该选择组件 只做拖拽移动
import React, { useState, useRef, useEffect, memo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import eventBus from '../utils/eventBus'

interface SelectItemProps {
  id: string
  x: number
  y: number
  width: number
  height: number
  selectedIds: string[]
}

const SelectItem: React.FC<SelectItemProps> = (props) => {
  const { id, x, y, width, height, selectedIds } = props

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  })

  const [position, setPosition] = useState({ x, y })

  // 监听事件
  useEffect(() => {
    const cb = (data: { delta: { x: number; y: number } }) => {
      setPosition((prevPositions) => ({
        x: prevPositions.x + data.delta.x,
        y: prevPositions.y + data.delta.y,
      }))
      // 通知其他所有组件
      if (selectedIds.length > 0) {
        for (const id of selectedIds) {
          eventBus.emit(`${id}-dragEnd`, { delta: data })
        }
      }
    }
    eventBus.on(`${id}-dragEnd`, cb)

    return () => {
      eventBus.off(`${id}-dragEnd`, cb)
    }
  }, [])

  // 通知其他组件更新选中区域
  useEffect(() => {
    if (selectedIds.length > 0) {
      for (const id of selectedIds) {
        eventBus.emit(`${id}-transform`, { transform })
      }
    }
  }, [transform, selectedIds])

  const style: React.CSSProperties = {
    position: 'absolute',
    top: position.y,
    left: position.x,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    // transition: transform ? 'transform 0.1s ease' : undefined,
    width: width,
    height: height,
  }

  return <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group-selected-area"></div>
}

const SelectItemMemo = memo(SelectItem)

export default SelectItemMemo
