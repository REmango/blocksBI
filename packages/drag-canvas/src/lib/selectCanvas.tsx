import React, { useState, useRef, useContext, memo } from 'react'
import CanvasContext from './canvasContext'
import { addEvent, removeEvent, restrictToBounds } from './utils/'
import eventBus from './utils/eventBus'

interface SelectCanvasProps {
  setSelectedArea: (area: { x: number; y: number; width: number; height: number } | null) => void
}

const SelectCanvas = (props: SelectCanvasProps) => {
  const { setSelectedArea } = props
  const { store, setStore } = useContext(CanvasContext)
  const isCanMove = useRef(false)
  const { canvasWidth, canvasHeight } = store

  const domRef = useRef<HTMLDivElement>(null)

  const mouseDownClickPosition = useRef({
    x: 0,
    y: 0,
    mouseX: 0,
    mouseY: 0,
    scrollTop: 0,
  })

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setSelectedArea(null)
    setStore({
      ...store,
      selectedIds: [],
    })

    isCanMove.current = true
    if (!domRef.current) {
      return
    }

    // 获取鼠标点击位置在容器的相对位置
    const { left, top } = domRef.current?.getBoundingClientRect() as DOMRect

    const { clientX, clientY } = event

    // 初始化鼠标点击位置
    const { scrollTop } = document.documentElement
    mouseDownClickPosition.current = {
      x: clientX + left,
      y: clientY + top,
      mouseX: event.pageX - left,
      mouseY: event.pageY - top,
      scrollTop: scrollTop,
    }

    // 监听鼠标移动
    addEvent(document.documentElement, 'mousemove', handleMouseMove)
    addEvent(document.documentElement, 'mouseup', handleMouseUp)
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isCanMove.current) {
      return
    }

    // 获取当前鼠标位置
    const { pageX, pageY } = event

    // 计算鼠标移动的距离
    const { x, y, mouseX, mouseY, scrollTop: preScrollY } = mouseDownClickPosition.current

    // 当前滚动位置
    const { scrollTop: currentScrollY } = document.documentElement

    // 计算鼠标移动的距离
    const deltaX = pageX - mouseX
    const deltaY = pageY - mouseY + currentScrollY - preScrollY

    const left = Math.min(x, pageX)
    const top = Math.min(y, pageY)

    const moveWidth = Math.abs(deltaX)
    const moveHeight = Math.abs(deltaY)

    const width = Math.min(moveWidth, canvasWidth - left)
    const height = Math.min(moveHeight, canvasHeight - top)

    // 实时更新选中的区域
    setSelectedArea({ x: left, y: top, width, height })
    eventBus.emit('selectedAreaChange', { x: left, y: top, width, height })
  }

  const handleMouseUp = () => {
    isCanMove.current = false
    setSelectedArea(null)
    eventBus.emit('selectedAreaEnd')
    removeEvent(document.documentElement, 'mousemove', handleMouseMove)
    removeEvent(document.documentElement, 'mouseup', handleMouseUp)
  }

  return <div className="drag-canvas-selection" onMouseDown={handleMouseDown} ref={domRef}></div>
}

export default SelectCanvas
