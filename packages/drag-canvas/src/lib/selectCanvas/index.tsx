import React, { useState, useRef, useContext, memo } from 'react'
import CanvasContext, { CanvasActionType } from '../canvasContext'
import { addEvent, removeEvent, restrictToBounds } from '../utils/'
import eventBus from '../utils/eventBus'

interface SelectCanvasProps {
  setSelectedArea: (area: { x: number; y: number; width: number; height: number } | null) => void
  canvasParentId?: string
}

const SelectCanvas = (props: SelectCanvasProps) => {
  const { setSelectedArea, canvasParentId } = props
  const { store, dispatch } = useContext(CanvasContext)
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
    dispatch({
      type: CanvasActionType.SET_SELECTED_IDS,
      payload: [],
    })

    isCanMove.current = true
    if (!domRef.current) {
      return
    }

    // 获取鼠标点击位置在容器的相对位置
    const { left, top } = domRef.current?.getBoundingClientRect() as DOMRect

    const { clientX, clientY } = event

    // 初始化鼠标点击位置
    const { scrollTop } = document.getElementById(canvasParentId as string) || document.documentElement

    mouseDownClickPosition.current = {
      x: clientX - left,
      y: clientY - top,
      mouseX: clientX,
      mouseY: clientY,
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
    console.log('left', event.clientX, event.clientY)
    const { left: rectLeft, top: rectTop } = domRef.current?.getBoundingClientRect() as DOMRect

    // 获取当前鼠标位置
    const { clientX, clientY } = event

    // 计算鼠标移动的距离
    const { x, y, mouseX, mouseY, scrollTop: preScrollY } = mouseDownClickPosition.current

    // 当前滚动位置
    const { scrollTop: currentScrollY } = document.getElementById(canvasParentId as string) || document.documentElement

    // 计算鼠标移动的距离
    const deltaX = clientX - mouseX
    const endY = clientY + currentScrollY - preScrollY

    const deltaY = endY - mouseY

    const curLeft = restrictToBounds(clientX - rectLeft, 0, canvasWidth)
    const curTop = restrictToBounds(endY - rectTop, 0, canvasHeight)

    const left = Math.min(x, curLeft)
    const top = Math.min(y, curTop)

    const moveWidth = Math.abs(deltaX)
    const moveHeight = Math.abs(deltaY)

    const width = Math.min(moveWidth, Math.abs(curLeft - x))
    const height = Math.min(moveHeight, Math.abs(curTop - y))

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

export default memo(SelectCanvas)
